import { IApi, IRoute, RUNTIME_TYPE_FILE_NAME } from '@umijs/max';
import { lodash, winPath } from '@umijs/max/plugin-utils';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

import { withTmpPath } from '../utils';

const getPkgHasDep = (api: IApi, depList: string[]) => {
  const hasDependency = (pkg: Record<string, any>, dep: string) => pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  const { pkg } = api;
  return depList.find((dep) => hasDependency(pkg, dep));
};

const getPkgPath = (api: IApi, pkgName: string, depList?: string[]) => {
  const _depList = depList && depList.length ? depList : [pkgName];
  const pkgHasDep = getPkgHasDep(api, _depList);

  if (pkgHasDep) {
    const nodeModulesPath = join(api.cwd, 'node_modules', pkgHasDep, 'package.json');

    if (existsSync(nodeModulesPath)) {
      return join(api.cwd, 'node_modules', pkgHasDep);
    }

    const cwd = process.cwd();
    if (api.cwd !== cwd) {
      const altNodeModulesPath = join(cwd, 'node_modules', pkgHasDep, 'package.json');
      if (existsSync(altNodeModulesPath)) {
        return join(cwd, 'node_modules', pkgHasDep);
      }
    }
  }

  // 如果项目中没有去找插件依赖的
  return dirname(require.resolve(`${pkgName}/package.json`));
};

const getIconsInfoForRoutes = (api: IApi) => {
  // 获取所有 icons
  const antIconsPath = winPath(getPkgPath(api, '@ant-design/icons'));

  const getAllIcons = () => {
    // 读取 index.d.ts
    const iconTypePath = join(antIconsPath, './lib/icons/index.d.ts');
    const iconTypeContent = readFileSync(iconTypePath, 'utf-8');

    // 截取 default as ${iconName}, 然后获取 iconName 转换为 map
    return [...iconTypeContent.matchAll(/default as (\w+)/g)].reduce((memo: Record<string, boolean>, cur) => {
      memo[cur[1]] = true;
      return memo;
    }, {});
  };

  const allIcons: Record<string, boolean> = getAllIcons();

  const iconsMap = Object.keys(api.appData.routes).reduce<Record<string, boolean>>((memo, id) => {
    const { icon } = api.appData.routes[id];
    if (icon) {
      const upperIcon = lodash.upperFirst(lodash.camelCase(icon));
      // @ts-ignore
      if (allIcons[upperIcon]) {
        memo[upperIcon] = true;
      }
      // @ts-ignore
      if (allIcons[`${upperIcon}Outlined`]) {
        memo[`${upperIcon}Outlined`] = true;
      }
    }
    return memo;
  }, {});
  const icons = Object.keys(iconsMap);

  return {
    icons,
    antIconsPath,
  };
};

export default (api: IApi) => {
  const TEMPLATE_DIR = join(__dirname, 'template');

  const creekWebComponentsPath = winPath(getPkgPath(api, '@creek/web-components'));
  const creekIconPath = require.resolve(`${creekWebComponentsPath}/dist/creek-icon`);

  api.describe({
    key: 'creekLayout',
    config: {
      schema({ zod }) {
        return zod
          .object({
            title: zod.string(),
            iconfontCNs: zod.string().array(),
          })
          .partial();
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    const version = require(`${creekWebComponentsPath}/package.json`).version;
    memo.pluginLayout = {
      creekWebComponentsPath,
      version,
    };
    return memo;
  });

  // 新增404页面
  api.modifyConfig((memo) => {
    const name = require(`${creekWebComponentsPath}/package.json`).name;
    memo.alias[name] = creekWebComponentsPath;

    const routes = memo.routes as IRoute[];
    const hasNotFoundPage = routes?.find((item) => [item.name, item.path].includes('404'));
    const defaultRoutes = [
      {
        name: '404',
        path: '*',
        hideInMenu: true,
        component: require.resolve(`${creekWebComponentsPath}/dist/creek-layout/Exception/NotFoundPage`),
      },
    ];

    if (!hasNotFoundPage) {
      memo.routes = [...routes, ...defaultRoutes];
    }

    return memo;
  });

  api.onGenerateFiles(() => {
    const hasInitialStatePlugin = api.config.initialState;
    const iconsInfo = getIconsInfoForRoutes(api);

    console.log(api.userConfig.creekLayout?.iconfontCNs, '11111');

    api.writeTmpFile({
      path: 'Layout.tsx',
      tplPath: join(TEMPLATE_DIR, '/layout.tpl'),
      context: {
        creekWebComponentsPath,
        hasInitialStatePlugin,
        access: api.config.access,
        creekLocaleConfig: api.config.creekLocaleConfig ? JSON.stringify(api.config.glocale, null, 2) : 'undefined',
        userConfig: JSON.stringify(api.config.creekLayout, null, 2),
      },
    });
    // 写入类型, RunTimeLayoutConfig 是 app.tsx 中 layout 配置的类型
    api.writeTmpFile({
      path: 'types.d.ts',
      tplPath: join(TEMPLATE_DIR, '/type.tpl'),
      context: {
        creekWebComponentsPath,
        hasInitialStatePlugin,
        access: api.config.access,
      },
    });

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      tplPath: join(TEMPLATE_DIR, '/runtime-config.type.tpl'),
      context: {},
    });

    api.writeTmpFile({
      path: 'icons.tsx',
      tplPath: join(TEMPLATE_DIR, '/icons.tpl'),
      context: {
        icons: iconsInfo.icons,
        antIconsPath: iconsInfo.antIconsPath,
        creekIconPath,
      },
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      tplPath: join(TEMPLATE_DIR, '/runtime.tpl'),
      context: {
        iconfontCNs: `${api.userConfig.creekLayout?.iconfontCNs}`,
      },
    });
  });

  api.addLayouts(() => {
    return [
      {
        id: 'ant-design-pro-layout',
        file: withTmpPath({ api, path: 'Layout.tsx' }),
        test: (route: any) => {
          return route.layout !== false;
        },
      },
    ];
  });

  api.addRuntimePluginKey(() => ['layout']);

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });
};

import { IApi, RUNTIME_TYPE_FILE_NAME } from '@umijs/max';
import { lodash, winPath } from '@umijs/max/plugin-utils';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { withTmpPath } from '../utils';

// 获取所有 icons
const antIconsPath = winPath(dirname(require.resolve('@ant-design/icons/package')));

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

const TEMPLATE_DIR = join(__dirname, 'template');

export default (api: IApi) => {

    const getPkgHasDep = (depList: string[]) => {
        const pkgHasDep = depList.find((dep) => {
            const { pkg } = api;
            if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
                return true;
            }
            return false;
        });
        return pkgHasDep
    };

    const getPkgPath = (pkgName: string, depList?: string[]) => {
        const _depList = depList && depList.length ? depList : [pkgName];

        const pkgHasDep = getPkgHasDep(_depList || []);
        if (pkgHasDep && existsSync(join(api.cwd, 'node_modules', pkgHasDep, 'package.json'))) {
            return join(api.cwd, 'node_modules', pkgHasDep);
        }

        const cwd = process.cwd();
        if (pkgHasDep && api.cwd !== cwd && existsSync(join(cwd, 'node_modules', pkgHasDep, 'package.json'))) {
            return join(cwd, 'node_modules', pkgHasDep);
        }
        // 如果项目中没有去找插件依赖的
        return dirname(require.resolve('@ant-design/pro-components/package.json'));
    };

    const defaultAntdProDeepList = ['@ant-design/pro-components', '@ant-design/pro-layout'];

    const prolayoutPkgHasDep = getPkgHasDep(defaultAntdProDeepList);
    const pkgPath = winPath(getPkgPath('@ant-design/pro-components', defaultAntdProDeepList));
    const creekWebUiComponentsPath = winPath(getPkgPath('@ant-design/pro-components'));

    api.describe({
        key: 'creekLayout',
        config: {
            schema({ zod }) {
                return zod
                    .object({
                        title: zod.string(),
                    })
                    .partial();
            },
            onChange: api.ConfigChangeType.regenerateTmpFiles,
        },
        enableBy: api.EnableBy.config,
    });

    api.modifyAppData((memo) => {
        const version = require(`${pkgPath}/package.json`).version;
        memo.pluginLayout = {
            pkgPath,
            version,
        };
        return memo;
    });

    // 只在没有自行依赖 @ant-design/pro-components 或 @alipay/tech-ui 时
    // 才使用插件中提供的 @ant-design/pro-components
    api.modifyConfig((memo) => {
        if (!prolayoutPkgHasDep) {
            const name = require(`${pkgPath}/package.json`).name;
            memo.alias[name] = pkgPath;
        }
        return memo;
    });

    api.onGenerateFiles(() => {
        const PKG_TYPE_REFERENCE = `/// <reference types=${pkgPath || '@ant-design/pro-components'} />`;
        const hasInitialStatePlugin = api.config.initialState;

        api.writeTmpFile({
            path: 'Layout.tsx',
            tplPath: join(TEMPLATE_DIR, '/layout.tpl'),
            context: {
                PKG_TYPE_REFERENCE,
                creekWebUiComponentsPath,
                pkgPath,
                hasInitialStatePlugin,
                access: api.config.access,
                creekLocaleConfig: api.config.creekLocaleConfig ? JSON.stringify(api.config.glocale, null, 2) : 'undefined',
                userConfig: JSON.stringify(api.config.creekLayout, null, 2),
            },
        });
        // 写入类型, RunTimeLayoutConfig 是 app.tsx 中 layout 配置的类型
        // 对于动态 layout 配置很有用
        api.writeTmpFile({
            path: 'types.d.ts',
            tplPath: join(TEMPLATE_DIR, '/type.tpl'),
            context: {
                PKG_TYPE_REFERENCE,
                pkgPath,
                hasInitialStatePlugin,
                access: api.config.access,
            },
        });
        api.writeTmpFile({
            path: RUNTIME_TYPE_FILE_NAME,
            content: `
import type { RunTimeLayoutConfig } from './types.d';
export interface IRuntimeConfig {
  layout?: RunTimeLayoutConfig
}
      `,
        });
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
        api.writeTmpFile({
            path: 'icons.tsx',
            content: `
${icons
                    .map((icon) => {
                        return `import ${icon} from '${antIconsPath}/es/icons/${icon}';`;
                    })
                    .join('\n')}
export default { ${icons.join(', ')} };
      `,
        });

        // runtime.tsx
        api.writeTmpFile({
            path: 'runtime.tsx',
            content: `
import React from 'react';
import icons from './icons';

function formatIcon(name: string) {
  return name
    .replace(name[0], name[0].toUpperCase())
    .replace(/-(\w)/g, function(all, letter) {
      return letter.toUpperCase();
    });
}

export function patchRoutes({ routes }) {
  Object.keys(routes).forEach(key => {
    const { icon } = routes[key];
    if (icon && typeof icon === 'string') {
      const upperIcon = formatIcon(icon);
      if (icons[upperIcon] || icons[upperIcon + 'Outlined']) {
        routes[key].icon = React.createElement(icons[upperIcon] || icons[upperIcon + 'Outlined']);
      }
    }
  });
}
      `,
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

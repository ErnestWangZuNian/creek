import React from 'react';
import { Result } from 'antd';
{{#plugins}}
import * as Plugin_{{{ index }}} from '{{{ path }}}';
{{/plugins}}
import { PluginManager, request, Navigate } from '@umijs/max';
import * as IconMap from '@ant-design/icons';


let pluginManager = null;

export function createPluginManager() {
  pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });
{{#isViteMode}}
  // fix https://github.com/umijs/umi/issues/10047
  // https://vitejs.dev/guide/api-hmr.html#hot-data 通过 hot data 持久化 pluginManager 解决 vite 热更时 getPluginManager 获取到 null 的情况
  if (process.env.NODE_ENV === 'development' && import.meta.hot) {
    import.meta.hot.data.pluginManager = pluginManager
  }
{{/isViteMode}}
  return pluginManager;
}

export function getPluginManager() {
{{#isViteMode}}
  // vite 热更模式优先从 hot data 中获取 pluginManager
  if (process.env.NODE_ENV === 'development' && import.meta.hot) {
    return import.meta.hot.data.pluginManager || pluginManager
  }
{{/isViteMode}}
  return pluginManager;
}



import { getGucConfig }  from '../plugin-guc/guc-config.ts';

const gucConfig = getGucConfig();

/** guc路由配置 */
let gucRoutes = []

/** guc登录 */
async function gucLogin() {
  const authenticated = await creekGuc.init(false);
  if (!authenticated) {
    await creekGuc.login();
  } else {
    const token = await creekGuc.getToken();
    localStorage.setItem('GUC_TOKEN', token);
  }
}

/** guc初始化 */
async function gucInit() {
  try {
    await gucLogin();
    return (await creekGuc.getUserInfo()) || {};
  } catch (error) {
    message.warning('用户登录过期');
    setTimeout(async () => {
      await creekGuc.logout();
    }, 100);
    return {}
  }
}

function __defaultExport (obj) {
  if (obj.default) {
    return typeof obj.default === 'function' ? obj.default() :  obj.default
  }
  return obj;
}

export function getPlugins() {
  const plugins = [
{{#plugins}}
    {
      apply: {{#hasDefaultExport}}__defaultExport(Plugin_{{{ index }}}),{{/hasDefaultExport}}{{^hasDefaultExport}}Plugin_{{{ index }}},{{/hasDefaultExport}}
      path: process.env.NODE_ENV === 'production' ? void 0 : '{{{ path }}}',
    },
{{/plugins}}
  ];

  const transformGucTreeToRoutes = async (menuList) => {
    if (!menuList.length) {
      return []
    }
    for(let i = 0; i < menuList.length; i++) {
      const menu = menuList[i]
      const metaData = menu.meta || {}
      const { title, hideMenu, icon} = metaData
      menu.name = title
      menu.hideInMenu = hideMenu
      // 这个加进去是为了区分guc类型的菜单和内部的菜单
      menu.menuType = "guc"
      if (icon) {
        const IconElement = IconMap[icon];
        const svgIcon = { __html: icon};
        const customIcon = icon?.startsWith('<svg') ? <i className="anticon anticon-control" dangerouslySetInnerHTML={svgIcon} />:  <i className={`anticon anticon-control iconfont ${icon}`}></i>
        menu.icon = IconElement ? <IconElement /> : customIcon
      }
      if (menu.redirect && !menu.element) {
        menu.children = menu.children || []
        menu.children.unshift({
          path: menu.path,
          element: <Navigate to={menu.redirect} replace />,
        })
      } 
      // 约定 menu.component === 'null' 的情况, 等同于 menu.component 没有值, 因为 guc 那边的菜单配置当前必传 component 属性
      else if (!menu.element && !menu.redirect && (menu.component && menu.component !== 'null')) {
        if (!menu.component.startsWith('/')) {
          console.error(`组件路径错误：${menu.component}`)
        }
        const componentPath = menu.component.endsWith('.tsx') ? menu.component : `${menu.component}/index.tsx`
        const Element = React.lazy(() => import(`@/pages${componentPath}`))
        menu.element = <React.Suspense><Element key={componentPath} oriMenuData={menu} /></React.Suspense>
      }
      if (menu.children) {
        await transformGucTreeToRoutes(menu.children)
      }
    }
    return menuList
  }

  const generateGucRoutes = async () => {
    const gucInstance = window.creekGuc
    let menuList = []
    if (gucInstance) {
      try {
        // window.__getMenuTree: 项目自定义调用的获取菜单树内容
        const getMenuTree = window.__getMenuTree || gucInstance.getMenusTree
        menuList = await getMenuTree(gucConfig.appId, gucConfig.menuCode)
      } catch(error) {
        console.error(`error in request guc menu/tree, error info is ${error}`)
      }
    }
    let finalMenuList = menuList
    if (gucConfig.slaveMode && gucConfig.slaveAppName) {
      finalMenuList = menuList.filter(_ => _.name === gucConfig.slaveAppName)[0]?.children || []
    }
    if(!gucConfig?.noRenderMenu){
      gucRoutes = await transformGucTreeToRoutes(finalMenuList)
    }
  }

  plugins.forEach(plugin => {
    if (plugin.apply?.getInitialState) {
      const emptyFn = () => {}
      const oldPatchClientRoutes = plugin.apply.patchClientRoutes || emptyFn
      plugin.apply = {...plugin.apply}
      
      /** redfine render */
      plugin.apply.render = async (oldRender) => {
        try {
          const userInfo = await gucInit();
          window.userInfo = userInfo
          if (gucConfig.backRoute) {
            await generateGucRoutes()
          }
          oldRender()
        } catch (error) {
          console.error(`error in render, error info is ${error}`)
          oldRender()
        }
      }

      /** redfine patchClientRoutes */
    plugin.apply.patchClientRoutes = async (data) => {
        const { routes=[] } = data;
        const patchRoutes = routes;
        const layoutRoutes = patchRoutes.find(item => item.id === 'ant-design-pro-layout');
        if(layoutRoutes){
          layoutRoutes.children =  layoutRoutes.children.concat(gucRoutes);
        }else{
         gucRoutes.forEach(item => {
            patchRoutes.unshift(item);
          })
        };
        await oldPatchClientRoutes(data)
      }
    }
  })

  return plugins;
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}


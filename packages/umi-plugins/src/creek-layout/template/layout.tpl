
import { useLocation, useAppData, IRoute, matchRoutes, Outlet, useNavigate } from 'umi';
import { useMemo } from 'react';
import _ from 'lodash';
import {CreekLayout} from '{{{creekWebComponentsPath}}}';
{{#hasInitialStatePlugin}}
import { useModel } from '@@/plugin-model';
{{/hasInitialStatePlugin}}
{{^hasInitialStatePlugin}}
const useModel = null;
{{/hasInitialStatePlugin}}

{{#access}}
import { useAccessMarkedRoutes } from '@@/plugin-access';
{{/access}}
{{^access}}
const useAccessMarkedRoutes = (r) => r;
{{/access}}
       
// 过滤出需要显示的路由, 这里的filterFn 指 不希望显示的层级
const filterRoutes = (
  routes: IRoute[],
  filterFn: (route: IRoute) => boolean
) => {
  if (routes.length === 0) {
    return [];
  }
  let newRoutes = [];
  for (const route of routes) {
    const newRoute = { ...route };
    if (filterFn(route)) {
      if (Array.isArray(newRoute.routes)) {
        newRoutes.push(...filterRoutes(newRoute.routes, filterFn));
      }
    } else {
      if (Array.isArray(newRoute.children)) {
        newRoute.children = filterRoutes(newRoute.children, filterFn);
        newRoute.routes = newRoute.children;
      }
      newRoutes.push(newRoute);
    }
  }
      
  return newRoutes;
};
      
// 格式化路由 处理因 wrapper 导致的 菜单 path 不一致
const mapRoutes = (routes: IRoute[]) => {
  if (routes.length === 0) {
    return [];
  }
  return routes.map((route) => {
    // 需要 copy 一份, 否则会污染原始数据
    const newRoute = { ...route };
    if (route.originPath) {
      newRoute.path = route.originPath;
    }

    if (Array.isArray(route.routes)) {
      newRoute.routes = mapRoutes(route.routes);
    }

    if (Array.isArray(route.children)) {
      newRoute.children = mapRoutes(route.children);
    }

    return newRoute;
  });
};
      
export default (props: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientRoutes, pluginManager } = useAppData();
  const initialInfo = (useModel && useModel('@@initialState')) || {
    initialState: undefined,
    loading: false,
    setInitialState: null,
  };
  const userConfig = {{{userConfig}}};
  const creekLocaleConfig = {{{creekLocaleConfig}}};
  const runtimeConfig = pluginManager.applyPlugins({
    key: 'layout',
    type: 'modify',
    initialValue: {
      ...initialInfo
    },
  });
  
  // 现在的 layout 及 wrapper 实现是通过父路由的形式实现的, 会导致路由数据多了冗余层级, proLayout 消费时, 无法正确展示菜单, 这里对冗余数据进行过滤操作
  const newRoutes = filterRoutes(
    clientRoutes.filter((route) => route.id === 'ant-design-pro-layout'),
    (route) => {
      return (
        (!!route.isLayout && route.id !== 'ant-design-pro-layout') ||
        !!route.isWrapper
      );
    }
  );
  const [route] = useAccessMarkedRoutes(mapRoutes(newRoutes));

  const matchedRoute = useMemo(() => matchRoutes(route.children, location.pathname)?.pop?.()?.route, [location.pathname]);

  return <CreekLayout
    location={location}
    runtimeConfig={runtimeConfig}
    matchedRoute={matchedRoute}
    navigate={navigate}
    userConfig={userConfig}
    route={route}
    initialInfo={initialInfo}
    children={
      runtimeConfig.childrenRender
        ? runtimeConfig.childrenRender(<Outlet />, props)
        : <Outlet />
    }
  />
}
        
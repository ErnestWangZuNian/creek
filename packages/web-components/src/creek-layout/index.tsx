import { MenuDataItem, ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { theme } from 'antd';
import _ from 'lodash';
import { useContext } from 'react';
import { matchPath } from 'react-router-dom';

import classnames from 'classnames';

import { IntlContext, useT } from '@creekjs/i18n/react';

import { CreekKeepAlive, CreekKeepAliveProps } from '../creek-keep-alive';
import { CreekLocaleButton } from '../creek-locale-button';
import { GlobalScrollbarStyle } from '../creek-style/scrollbar';
import { FullScreen, LayoutSettings, UserInfo, UserInfoProps } from './ActionRender';
import { CollapsedButton, useCollapsedStore } from './CollapseButton';
import { Exception } from './Exception';
import { useLayoutSettingsStore } from './useLayoutSettingsStore';

export type CreekLayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  navigate?: (path?: string | number) => void;
  showFullScreen?: boolean;
  showLocaleButton?: boolean;
  showSettingsButton?: boolean;
  showThemeColor?: boolean;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
  keepAlive?: boolean | CreekKeepAliveProps;
  extraActions?: React.ReactNode[];
  clientRoutes?: any[];
  iconFontCNs?: string[];
  /**
   * 用户信息区域，支持传入配置对象（名称、头像、下拉菜单）或自定义渲染函数
   * - 传对象：自动使用 UserInfo 组件渲染
   * - 传函数：返回 ReactNode 直接渲染，返回 UserInfoProps 对象则使用 UserInfo 组件渲染
   */
  renderUser?: UserInfoProps | (() => React.ReactNode | UserInfoProps);
  /**
   * redirect 路由路径映射，key 为 redirect 路径，value 为目标路径，用于过滤和跳转
   */
  redirectPaths?: Record<string, string>;
};

const MenuName = ({ name, path }: { name?: string; path?: string }) => {
  const t = useT();
  const key = !path || path === '/' ? 'menu.home' : `menu${path.replace(/\//g, '.')}`;
  return t(key, name);
};

export const CreekLayout = (props: CreekLayoutProps) => {
  const {
    route,
    userConfig,
    runtimeConfig,
    children,
    location,
    navigate,
    showFullScreen = false,
    showLocaleButton = false,
    showSettingsButton = false,
    showThemeColor = true,
    keepAlive = false,
    extraActions = [],
    clientRoutes,
    iconFontCNs,
    renderUser,
    redirectPaths = {},
    ...more
  } = props;

  const { useToken } = theme;
  const { token } = useToken();

  const { collapsed } = useCollapsedStore();
  const settingsStore = useLayoutSettingsStore();

  const actualShowFullScreen = showFullScreen && (settingsStore.showFullScreen ?? true);
  const actualShowLocaleButton = showLocaleButton && (settingsStore.showLocaleButton ?? true);
  const colorPrimary = settingsStore.colorPrimary || token.colorPrimary;
  const actualKeepAlive = keepAlive && (settingsStore.keepAlive ?? true);

  const _userConfig = { ...userConfig, ...runtimeConfig };

  const intlContext = useContext(IntlContext);
  const hasI18n = !!intlContext && actualShowLocaleButton;

  const menuDataRender = useMemoizedFn((menuData: MenuDataItem[]) => {
    // 根据当前是否开启了国际化（上下文是否存在）以及用户配置来判断是否包裹菜单翻译
    const isLocaleEnabled = hasI18n;

    const mapMenu = (items: MenuDataItem[]): MenuDataItem[] => {
      return items.map((item) => {
        return {
          ...item,
          name: (isLocaleEnabled ? <MenuName name={item.name} path={item.path} /> : item.name) as string,
          children: item.children ? mapMenu(item.children) : undefined,
        };
      });
    };
    return mapMenu(menuData);
  });

  const menuItemRender: ProLayoutProps['menuItemRender'] = useMemoizedFn((itemProps, defaultDom) => {
    // 如果路由路径包含动态参数（如 :id），则不直接导航，避免导航到 /path/:id 这样的无效路径
    const hasDynamicParam = itemProps.path?.includes(':');
    if (hasDynamicParam) {
      return defaultDom;
    }
    return (
      <span
        onClick={() => {
          if (navigate) {
            navigate(itemProps.path);
          }
        }}
      >
        {defaultDom}
      </span>
    );
  });

  const getTabTitle = useMemoizedFn((pathname: string): string | React.ReactNode => {
    const routes = (route?.routes ?? []) as MenuDataItem[];

    const findTitle = (items: MenuDataItem[]): string | undefined => {
      for (const item of items) {
        // 使用 matchPath 支持动态路由参数匹配（如 /path/:id）
        if (item.path && matchPath(item.path, pathname)) {
          return item.name ?? item.title;
        }
        if (item.children) {
          const found = findTitle(item.children);
          if (found) return found;
        }
      }
    };

    const title = findTitle(routes) ?? pathname;

    return hasI18n ? <MenuName name={title} path={pathname} /> : title;
  });

  const actions: React.ReactNode[] = [...extraActions];

  if (actualShowFullScreen) {
    actions.push(<FullScreen key="full-screen" />);
  }

  if (actualShowLocaleButton) {
    actions.push(<CreekLocaleButton key="locale-button" />);
  }

  if (showSettingsButton) {
    actions.push(<LayoutSettings key="settings" defaultShowFullScreen={showFullScreen} defaultShowLocaleButton={showLocaleButton} defaultShowThemeColor={showThemeColor} defaultKeepAlive={_.isBoolean(keepAlive) ? keepAlive : true} />);
  }

  // 用户信息放在最右侧
  if (renderUser) {
    let result = typeof renderUser === 'function' ? renderUser() : renderUser;
    const isUserInfoProps = (val: unknown): val is UserInfoProps =>
      val !== null && typeof val === 'object' && ('name' in val || 'avatar' in val || 'menu' in val);
    const userInfoNode = isUserInfoProps(result) ? <UserInfo {...result} /> : result;
    actions.push(<span key="user-info">{userInfoNode}</span>);
  }

  const keepAliveProps = _.isBoolean(keepAlive) ? {} : keepAlive;

  const layoutContent = (
    <ProLayout
      className={classnames('creek-layout-container', _userConfig?.className)}
      route={route}
      title={_userConfig?.title}
      siderWidth={200}
      location={location}
      menuDataRender={menuDataRender}
      menuItemRender={menuItemRender}
      actionsRender={() => actions}
      token={{
        header: {
          colorBgHeader: '#fff',
          colorHeaderTitle: 'rgba(0, 0, 0, 0.80);',
          colorTextMenuSelected: colorPrimary,
          heightLayoutHeader: 48,
        },
        sider: {
          colorMenuBackground: '#f7f8fa',
          colorBgMenuItemSelected: 'transparent',
          colorTextMenuActive: colorPrimary,
          colorTextMenuSelected: colorPrimary,
          colorTextMenuItemHover: colorPrimary,
          colorTextMenu: '#333',
        },
        pageContainer: {
          paddingBlockPageContainerContent: 0,
          paddingInlinePageContainerContent: 0,
          colorBgPageContainer: 'linear-gradient(180deg, #F7F9FF 0%, #FFF 45.59%);',
        },
      }}
      fixSiderbar
      fixedHeader
      collapsed={collapsed}
      collapsedButtonRender={(collapsed) => {
        return <CollapsedButton collapsed={collapsed} />;
      }}
      {...more}
    >
      <GlobalScrollbarStyle />
      <Exception>{actualKeepAlive ? <CreekKeepAlive getTabTitle={getTabTitle} routes={clientRoutes ?? route?.routes} redirectPaths={redirectPaths} {...keepAliveProps} /> : children}</Exception>
    </ProLayout>
  );

  return layoutContent;
};

export * from './Exception';
export { UserInfo, type UserInfoProps } from './ActionRender';

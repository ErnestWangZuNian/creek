import { MenuDataItem, ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { theme } from 'antd';
import _ from 'lodash';
import { useContext } from 'react';

import classnames from 'classnames';

import { IntlContext, useT } from '@creekjs/i18n/react';

import { CreekKeepAlive, CreekKeepAliveProps } from '../creek-keep-alive';
import { CreekLocaleButton } from '../creek-locale-button';
import { GlobalScrollbarStyle } from '../creek-style/scrollbar';
import { FullScreen, LayoutSettings } from './ActionRender';
import { CollapsedButton, useCollapsedStore } from './CollapseButton';
import { Exception } from './Exception';
import { useLayoutSettingsStore } from './useLayoutSettingsStore';

export type LayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  navigate?: (path?: string | number) => void;
  showFullScreen?: boolean;
  showLocaleButton?: boolean;
  showSettingsButton?: boolean;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
  keepAlive?: boolean | CreekKeepAliveProps;
  extraActions?: React.ReactNode[];
};

const MenuName = ({ name, path }: { name?: string; path?: string }) => {
  const t = useT();
  const key = !path || path === '/' ? 'menu.home' : `menu${path.replace(/\//g, '.')}`;
  return t(key, name);
};

export const CreekLayout = (props: LayoutProps) => {
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
    keepAlive = false,
    extraActions = [],
    ...more
  } = props;

  const { useToken } = theme;
  const { token } = useToken();

  const { collapsed } = useCollapsedStore();
  const settingsStore = useLayoutSettingsStore();

  const actualShowFullScreen = settingsStore.showFullScreen ?? showFullScreen;
  const actualShowLocaleButton = settingsStore.showLocaleButton ?? showLocaleButton;
  const colorPrimary = settingsStore.colorPrimary || token.colorPrimary;
  const actualKeepAlive = settingsStore.keepAlive ?? keepAlive;

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
        if (item.path === pathname) return item.name ?? item.title;
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
    actions.push(<LayoutSettings key="settings" defaultShowFullScreen={showFullScreen} defaultShowLocaleButton={showLocaleButton} defaultKeepAlive={_.isBoolean(keepAlive) ? keepAlive : true} />);
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
      <Exception>{actualKeepAlive ? <CreekKeepAlive getTabTitle={getTabTitle} {...keepAliveProps} /> : children}</Exception>
    </ProLayout>
  );

  return layoutContent;
};

export * from './Exception';

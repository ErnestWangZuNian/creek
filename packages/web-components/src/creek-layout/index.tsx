import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { theme } from 'antd';
import classnames from 'classnames';
import _ from 'lodash';

import { CreekKeepAlive, CreekKeepAliveProps } from '../creek-keep-alive';
import { GlobalScrollbarStyle } from '../creek-style/scrollbar';
import { FullScreen } from './ActionRender';
import { CollapsedButton, useCollapsedStore } from './CollapseButton';
import { Exception } from './Exception';

export type LayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  navigate?: (path?: string | number) => void;
  showFullScreen?: boolean;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
  keepAlive?: boolean | CreekKeepAliveProps;
  extraActions?: React.ReactNode[];
};

export const CreekLayout = (props: LayoutProps) => {
  const { route, userConfig, runtimeConfig, children, location, navigate, showFullScreen, keepAlive = true, extraActions = [], ...more } = props;

  const { useToken } = theme;
  const { token } = useToken();

  const { collapsed } = useCollapsedStore();

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

  const getTabTitle = useMemoizedFn((pathname: string) => {
    const findTitle = (routes: any[]): string | React.ReactNode | undefined => {
      for (const r of routes) {
        if (r.path === pathname) return r.name || r.title;
        if (r.children) {
          const found = findTitle(r.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findTitle(route?.routes || []) || pathname;
  });

  const actions: React.ReactNode[] = [...extraActions];

  if (showFullScreen) {
    actions.push(<FullScreen key="full-screen" />);
  }

  const keepAliveProps = _.isBoolean(keepAlive) ? {} : keepAlive;

  const _userConfig = { ...userConfig, ...runtimeConfig };

  return (
    <ProLayout
      className={classnames('creek-layout-container', _userConfig?.className)}
      route={route}
      title={_userConfig?.title}
      siderWidth={200}
      location={location}
      menuItemRender={menuItemRender}
      actionsRender={() => actions}
      token={{
        header: {
          colorBgHeader: '#fff',
          colorHeaderTitle: 'rgba(0, 0, 0, 0.80);',
          colorTextMenuSelected: token.colorPrimary,
          heightLayoutHeader: 48,
        },
        sider: {
          colorMenuBackground: '#f7f8fa',
          colorBgMenuItemSelected: 'transparent',
          colorTextMenuActive: token.colorPrimary,
          colorTextMenuSelected: token.colorPrimary,
          colorTextMenuItemHover: token.colorPrimary,
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
      <Exception>{keepAlive ? <CreekKeepAlive getTabTitle={getTabTitle} {...keepAliveProps} /> : children}</Exception>
    </ProLayout>
  );
};

export * from './Exception';

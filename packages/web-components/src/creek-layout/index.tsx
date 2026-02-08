import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { theme } from 'antd';
import classnames from 'classnames';

import { FullScreen, UserInfo } from './ActionRender';
import { CollapsedButton, useCollapsedStore } from './CollapseButton';
import { Exception } from './Exception';

export type LayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  navigate?: (path?: string | number) => void;
  showFullScreen?: boolean;
  userInfo?: {
    name?: React.ReactNode;
    avatar?: string;
    menu?: any;
  };
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
};

export const CreekLayout = (props: LayoutProps) => {
  const { route, userConfig, runtimeConfig, children, location, navigate, showFullScreen, userInfo, ...more } = props;

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

  const actions: React.ReactNode[] = [];
  if (showFullScreen) {
    actions.push(<FullScreen key="full-screen" />);
  }
  if (userInfo) {
    actions.push(<UserInfo key="user-info" {...userInfo} />);
  }

  return (
    <ProLayout
      className={classnames('creek-layout-container', userConfig?.className)}
      route={route}
      title={userConfig?.title}
      siderWidth={212}
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
          paddingBlockPageContainerContent: token.padding,
          paddingInlinePageContainerContent: token.padding,
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
      <Exception>{children}</Exception>
    </ProLayout>
  );
};

export * from './Exception';

import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { useMemoizedFn } from "ahooks";
import { theme } from "antd";
import classnames from "classnames";

import { CollapsedButton, useCollapsedStore } from "./CollapseButton";
import { Exception } from "./Exception";
import { HeaderContent } from "./HeaderContent";

export type LayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  navigate?: (path?: string | number) => void;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
};

export const CreekLayout = (props: LayoutProps) => {
  const {
    route,
    userConfig,
    runtimeConfig,
    children,
    location,
    navigate,
    ...more
  } = props;

  const { useToken } = theme;
  const { token } = useToken();

  const { collapsed } = useCollapsedStore();

  const menuItemRender: ProLayoutProps["menuItemRender"] = useMemoizedFn(
    (itemProps, defaultDom) => {
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
    }
  );

  return (
    <ProLayout
      className={classnames("creek-layout-container", userConfig?.className)}
      layout="mix"
      route={route}
      title={userConfig?.title}
      siderWidth={212}
      location={location}
      menuItemRender={menuItemRender}
      headerContentRender={() => {
        return <HeaderContent />;
      }}
      token={{
        header: {
          colorBgHeader: "#2c2c2c",
          colorHeaderTitle: "#fff",
          colorTextMenuSelected: "#fff",
          heightLayoutHeader: 48,
        },
        sider: {
          colorMenuBackground: "#fff",
          colorBgMenuItemSelected: "transparent",
          colorTextMenuActive: token.colorPrimary,
          colorTextMenuSelected: token.colorPrimary,
          colorTextMenuItemHover: token.colorPrimary,
          colorTextMenu: "#333",
        },
        pageContainer: {
          paddingBlockPageContainerContent: 0,
          paddingInlinePageContainerContent: 0,
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

export * from "./Exception";

import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { theme } from "antd";
import classnames from "classnames";

import { CollapsedButton, useCollapsedStore } from "./CollapseButton";

export type LayoutProps = ProLayoutProps & {
  runtimeConfig: ProLayoutProps;
  userConfig?: ProLayoutProps;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
};

export const CreekLayout = (props: LayoutProps) => {
  const { route, userConfig, runtimeConfig, children, ...more } = props;

  const { useToken } = theme;
  const { token } = useToken();

  const { collapsed } = useCollapsedStore();

  console.log(collapsed, "1111");

  return (
    <ProLayout
      className={classnames("creek-layout-container", userConfig?.className)}
      layout="mix"
      route={route}
      location={location}
      title={userConfig?.title}
      siderWidth={212}
      token={{
        header: {
          colorBgHeader: "#2c2c2c",
          colorHeaderTitle: "#fff",
          colorTextMenuSelected: "#fff",
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
      {children}
    </ProLayout>
  );
};

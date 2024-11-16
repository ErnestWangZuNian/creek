import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { theme } from "antd";
import classnames from "classnames";

const { useToken } = theme;

export type LayoutProps = {
  route?: any[];
  location: Location;
  outlet?: any;
  navigate: any;
  matchedRoute: any;
  runtimeConfig: Record<string, any>;
  userConfig?: Record<string, any>;
  initialInfo?: {
    initialState: any;
    loading: boolean;
    setInitialState: () => void;
  };
  formatMessage?: ProLayoutProps["formatMessage"];
};

export const CreekLayout = (props: LayoutProps) => {
  const {
    route,
    userConfig = {},
    formatMessage,
    location,
    navigate,
    runtimeConfig,
  } = props;

  const { token } = useToken();

  return (
    <ProLayout
      className={classnames("creek-layout-container", userConfig?.className)}
      layout="mix"
      route={route}
      location={location}
      title={userConfig?.title}
      siderWidth={212}
      onMenuHeaderClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        navigate("/");
      }}
      formatMessage={userConfig?.formatMessage || formatMessage}
      menu={{ autoClose: false }}
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
      {...runtimeConfig}
    />
  );
};

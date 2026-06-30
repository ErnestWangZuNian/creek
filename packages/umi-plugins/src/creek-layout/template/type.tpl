    {{{PKG_TYPE_REFERENCE}}}
    {{#pkgPath}}
      import type { ProLayoutProps, HeaderProps } from '{{{pkgPath}}}';
    {{/pkgPath}}
    {{^pkgPath}}
      import type { ProLayoutProps, HeaderProps } from '@ant-design/pro-components';
    {{/pkgPath}}
    {{#hasInitialStatePlugin}}
     import type InitialStateType from '@@/plugin-initialState/@@initialState';
     type InitDataType = ReturnType<typeof InitialStateType>; 
    {{/hasInitialStatePlugin}}
    {{^hasInitialStatePlugin}}
     type InitDataType = any;
    {{/hasInitialStatePlugin}}
    import type { IConfigFromPlugins } from '@@/core/pluginConfig';
    import type { CreekKeepAliveProps, UserInfoProps } from '{{{creekWebComponentsPath}}}';

    export type RunTimeLayoutConfig = (initData: InitDataType) => ProLayoutProps & {
      showFullScreen?: boolean;
      showLocaleButton?: boolean;
      showSettingsButton?: boolean;
      showThemeColor?: boolean;
      keepAlive?: boolean | CreekKeepAliveProps;
      extraActions?: React.ReactNode[];
      unAccessible?: JSX.Element;
      iconFontCNs?: string[];
      renderUser?: UserInfoProps | (() => React.ReactNode | UserInfoProps);
    };
    
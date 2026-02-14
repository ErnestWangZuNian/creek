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
    import { CreekKeepAliveProps } from '{{{creekWebComponentsPath}}}';

    export type RunTimeLayoutConfig = (initData: InitDataType) => ProLayoutProps & {
      showDarkButton?: boolean;
      provider?:  React.ReactNode;
      keepAlive?: boolean | CreekKeepAliveProps;
      extraActions?: React.ReactNode[];
      unAccessible?: JSX.Element;
      iconFontCNs?: string[];
    };
    
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

    export type RunTimeLayoutConfig = (initData: InitDataType) => ProLayoutProps & {
      dropdownProps?: DropDownProps;
      showDarkButton?: boolean;
      showFooter?: boolean;
      provider?:  React.ReactNode;
      userName?: string;
      hideKeepalive?: boolean;
      rightContentExtra?: React.ReactNode;
      childrenRender?: (dom: JSX.Element, props: ProLayoutProps) => React.ReactNode;
      unAccessible?: JSX.Element;
      logout?: (initialState: InitDataType['initialState']) => Promise<void> | void;
      iconFontCNs?: string[];
      rightRender?: (
        initialState: InitDataType['initialState'],
        setInitialState: InitDataType['setInitialState'],
        runtimeConfig: RunTimeLayoutConfig,
      ) => JSX.Element;
      
    };
    
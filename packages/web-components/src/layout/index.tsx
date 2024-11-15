import { MenuDataItem, ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import { useSafeState, useThrottleFn } from 'ahooks';
import { theme } from 'antd';
import classnames from 'classnames';




const { useToken } = theme;

const formatMenuDatas = (datas: MenuDataItem[]): MenuDataItem[] =>
    datas.map((item) => ({
        disabledTooltip: true,
        ...item,
        children: item.children?.length ? formatMenuDatas(item.children) : void 0,
    }));

export type LayoutProps = {
    route?: IRoute[];
    location: Location;
    outlet?: any;
    navigate: any;
    matchedRoute: any;
    ProLayout: typeof ProLayout;
    runtimeConfig: Record<string, any>;
    userConfig?: Record<string, any>;
    glocaleConfig?: Record<string, any>;
    initialInfo?: {
        initialState: any;
        loading: boolean;
        setInitialState: () => void;
    };
    formatMessage?: ProLayoutProps['formatMessage'];
};

export const CreekLayout = (props: LayoutProps) => {
    const {
        route,
        userConfig = {},
        glocaleConfig,
        initialInfo,
        formatMessage,
        location,
        navigate,
        runtimeConfig,
        matchedRoute,
        outlet,
        ProLayout,
        ...others
    } = props;

    const { token } = useToken();
    const { initialState, loading, setInitialState } = initialInfo || {};
    const [collapsed, setCollapsedInner] = useSafeState(false);
    const [searchMenu, setSearchMenu] = useSafeState('');
    const [openKeys, setOpenKeys] = useSafeState<string[]>([]);
    const [isRefreshRoute, setIsRefreshRoute] = useSafeState(false);
    const [filterRoute, setFilterRoute] = useSafeState<{
        data?: IRoute | IRoute[];
        matchKeys?: string[];
    }>();

    const { run: setCollapsed } = useThrottleFn(
        () => {
            setCollapsedInner(!collapsed);
        },
        {
            wait: 300,
        },
    );


    const defaultHeaderHeight = 48;
    const hasAlertHeaderHeight = 88;





    return (
        <ProLayout
            className={classnames('gplus-layout-container', userConfig?.className)}
            layout="mix"
            route={filterRoute?.data}
            openKeys={openKeys}
            onOpenChange={(keys) => {
                if (!keys) return;
                if (isRefreshRoute) {
                    setIsRefreshRoute(false);
                    return;
                }
                setOpenKeys(keys);
            }}
            location={location}
            title={userConfig?.title}
            siderWidth={212}
            onMenuHeaderClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate('/');
            }}
            formatMessage={userConfig?.formatMessage || formatMessage}
            menu={{ autoClose: false }}
            token={{
                header: {
                    colorBgHeader: '#2c2c2c',
                    colorHeaderTitle: '#fff',
                    colorTextMenuSelected: '#fff',

                },
                sider: {
                    colorMenuBackground: '#fff',
                    colorBgMenuItemSelected: 'transparent',
                    colorTextMenuActive: token.colorPrimary,
                    colorTextMenuSelected: token.colorPrimary,
                    colorTextMenuItemHover: token.colorPrimary,
                    colorTextMenu: '#333',
                },
                pageContainer: {
                    paddingBlockPageContainerContent: 0,
                    paddingInlinePageContainerContent: 0,
                },
            }}
            collapsed={collapsed}



            menuDataRender={(datas) => formatMenuDatas(datas)}

            fixSiderbar
            fixedHeader



            {...runtimeConfig}
            rightContentRender={
                runtimeConfig.rightContentRender !== false &&
                ((layoutProps) => {
                    const contextProps = {
                        // BREAK CHANGE userConfig > runtimeConfig
                        userConfig,
                        glocaleConfig,
                        runtimeConfig,
                        loading,
                        initialState,
                        setInitialState,
                    };
                    const dom = <RightContent {...contextProps} {...others} />;
                    if (runtimeConfig.rightContentRender) {
                        return runtimeConfig.rightContentRender(layoutProps, dom, { ...contextProps, ...others });
                    }
                    return dom;
                })
            }>

        </ProLayout>
    );
};

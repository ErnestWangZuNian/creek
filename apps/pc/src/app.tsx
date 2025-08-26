// 运行时配置
import { RunTimeLayoutConfig } from '@umijs/max';
import { ConfigProvider } from 'antd';

import { DuplicatePlugin, LoadingPlugin, request } from '@creekjs/request';
import { Loading } from '@creekjs/web-components';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout: RunTimeLayoutConfig = (props) => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
  };
}

export const rootContainer = (children: React.ReactNode) => {
  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#4e43ff',
      },
    }}>
     {children}
    </ConfigProvider>
  );
}

request
  .createInstance({})
  .pluginManager.use(
    new LoadingPlugin({
      showLoading(config) {
        if (config.openLoading) {
          Loading.open();
        }
      },
      hideLoading(config) {
        if (config.openLoading) {
          Loading.close();
        }
      },
    }),
  )
  .use(new DuplicatePlugin());

  

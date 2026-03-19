// 运行时配置
import { RunTimeLayoutConfig } from '@umijs/max';
import { App } from 'antd';
import React from 'react';

import { AppProvider, CreekConfigProvider, CreekLocaleButton } from '@creekjs/web-components';

import { initRequest } from './request';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

//  布局
export const layout: RunTimeLayoutConfig = () => {
  return {
    keepAlive: false,
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    layout: 'mix',
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
    extraActions: [<CreekLocaleButton key="change-language" />],
  };
};

// 全局配置
export const rootContainer = (children: React.ReactNode) => {
  return (
    <CreekConfigProvider
      componentSize="small"
      theme={{
        token: {
          colorPrimary: '#00c07f',
        },
      }}
    >
      <App>
        <AppProvider>{children}</AppProvider>
      </App>
    </CreekConfigProvider>
  );
};

// 请求配置
initRequest();

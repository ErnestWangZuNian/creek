// 运行时配置
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { RunTimeLayoutConfig } from '@umijs/max';
import { Avatar, Dropdown, Space } from 'antd';
import React from 'react';

import { CreekConfigProvider } from '@creekjs/web-components';

import { initRequest } from './request';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

//  布局
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    logo: '/logo.svg',
    layout: 'mix',
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
    showLocaleButton: false,
    showThemeColor: false,
    // 支持函数渲染，可访问 initialState 等运行时数据
    // 返回对象：自动使用 UserInfo 组件渲染（支持 name、avatar、menu）
    // 返回 ReactNode：直接渲染自定义组件
    renderUser: () =>  {
      return {
        name: 'Admin',
        menu: {
          items: [
            {
              key: 'userCenter',
              icon: <UserOutlined />,
              label: '个人中心',
            },
            {
              type: 'divider' as const,
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录',
            },
          ],
          onClick: ({ key }: { key: string }) => {
            if (key === 'logout') {
              console.log('logout');
            }
          },
        },
      };
    }
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
      {children}
    </CreekConfigProvider>
  );
};

// 请求配置
initRequest();

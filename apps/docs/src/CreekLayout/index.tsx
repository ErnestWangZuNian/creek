import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { CreekConfigProvider, CreekLayout, CreekPageContainer } from '@creekjs/web-components';
import { Button, Card, Descriptions } from 'antd';
import React, { useState } from 'react';

// 模拟路由配置
const route = {
  path: '/',
  routes: [
    {
      path: '/dashboard',
      name: '仪表盘',
      icon: <DashboardOutlined />,
    },
    {
      path: '/users',
      name: '用户管理',
      icon: <UserOutlined />,
    },
  ],
};

const LayoutContent = ({ pathname }: { pathname: string }) => {
  return (
    <CreekPageContainer title={pathname === '/dashboard' ? '仪表盘' : '用户管理'}>
      <div style={{ minHeight: '400px', padding: 24, backgroundColor: '#f0f2f5' }}>
        <Card title={`布局内容演示 - 当前路径: ${pathname}`} bordered={false}>
          <Descriptions column={1}>
            <Descriptions.Item label="当前位置">
              这里是 CreekLayout 的内部插槽渲染区域
            </Descriptions.Item>
            <Descriptions.Item label="提示">
              你可以点击右上角的 <b>设置图标</b> 打开内置的主题配置面板。
            </Descriptions.Item>
            <Descriptions.Item label="提示2">
              你也可以点击右上角的 <b>全屏图标</b> 体验全屏切换，或者点击{' '}
              <b>语言图标</b> 体验多语言。
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 24 }}>
            <Button type="primary">这是一个主题色按钮</Button>
          </div>
        </Card>
      </div>
    </CreekPageContainer>
  );
};

export default () => {
  const [pathname, setPathname] = useState('/dashboard');

  return (
    <div
      style={{
        height: '600px',
        transform: 'scale(1)',
        border: '1px solid #e8e8e8',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          height: '32px',
          background: '#f0f2f5',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: '8px',
        }}
      >
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
      </div>
      <div style={{ height: 'calc(100% - 32px)', overflow: 'auto' }}>
        <CreekConfigProvider>
          <CreekLayout
            // 模拟路由属性
            route={route}
            location={{ pathname }}
            menuItemRender={(item, dom) => (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setPathname(item.path || '/dashboard');
                }}
              >
                {dom}
              </a>
            )}
            // 开启全部高级特性
            showFullScreen={true}
            showLocaleButton={true}
            showSettingsButton={true}
            keepAlive={false} // 在纯组件展示 Demo 中必须保持为 false，因为这里没有真实的 react-router 上下文
            // 基础配置
            title="Creek Admin"
            logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
            layout="mix"
            navTheme="light"
            runtimeConfig={{}}
          >
            <LayoutContent pathname={pathname} />
          </CreekLayout>
        </CreekConfigProvider>
      </div>
    </div>
  );
};

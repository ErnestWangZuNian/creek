import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  creekLayout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
      icon: 'HomeOutlined'
    },
    {
      name: '权限演示权限演示权限演示权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
  ],
  mfsu: false,
  plugins: [require.resolve('@creek/umi-plugins/dist/creek-layout')],
  npmClient: 'pnpm',
});


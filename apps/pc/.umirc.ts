import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  initialState: {},
  request: {},
  model:{},
  creekLayout: {
    title: 'creekjs',
    iconfontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js']
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
      icon: 'icon-auth'
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


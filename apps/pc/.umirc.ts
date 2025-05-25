import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  initialState: {},
  request: {},
  model: {},
  creekLayout: {
    title: 'creekjs',
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
  },
  openApi: {
    schemaPath: 'https://petstore.swagger.io/v2/swagger.json',
    requestLibPath: "import { request } from '@creek/request';",
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
      icon: 'HomeOutlined',
    },
    {
      name: '权限演示权限演示权限演示权限演示',
      path: '/access',
      component: './Access',
      icon: 'icon-auth',
    },
  ],
  mfsu: false,
  plugins: [require.resolve('@creek/umi-plugins/dist/creek-layout'), require.resolve('@creek/umi-plugins/dist/open-api')],
  npmClient: 'pnpm',
  proxy: {
    '/v2/': {
      target: 'https://petstore.swagger.io',
      changeOrigin: true,
      secure: false,
    },
  }
});

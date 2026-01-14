import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  initialState: {},
  request: {},
  model: {},
  mako: {},
  creekLayout: {
    title: 'creekjs',
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
  },
  openApi: {
    schemaPath: 'http://14.103.138.148:8080/v3/api-docs',
    requestLibPath: "import { request } from '@creekjs/request';",
  },
  routes: [
    {
      path: '/',
      redirect: '/store',
    },
    {
      name: '店铺管理',
      path: '/store',
      component: './Store',
      icon: 'HomeOutlined',
    },
  ],
  mfsu: false,
  plugins: [require.resolve('@creekjs/umi-plugins/dist/creek-layout'), require.resolve('@creekjs/umi-plugins/dist/open-api')],
  npmClient: 'pnpm',
  proxy: {
    '/stores': {
      target: 'http://10.162.26.212:8080/',
      changeOrigin: true,
      secure: false,
    },
  }
});

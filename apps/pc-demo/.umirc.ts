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
  routes: [
    {
      path: '/',
      name: '首页',
      component: './Demo',
    },
    {
      path: '/test',
      name: '测试',
      component: './Test',
    },
  ],
  mfsu: false,
  presets: [require.resolve('@creekjs/umi-plugins')],
  openApi: {
    schemaPath: 'https://petstore.swagger.io/v2/swagger.json',
    requestLibPath: "import { request } from '@creekjs/request';",
  },
  proxy: {
    '/pet': {
      target: 'https://petstore.swagger.io/v2',
      changeOrigin: true,
    },
  },
  npmClient: 'pnpm',
});

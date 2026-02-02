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
    schemaPath: 'http://localhost:8080/catering/v3/api-docs',
    requestLibPath: "import { request } from '@creekjs/request';",
  },
  routes: [
    {
      path: '/',
      component: './Home',
    },
  ],
  mfsu: false,
  plugins: [require.resolve('@creekjs/umi-plugins/dist/creek-layout'), require.resolve('@creekjs/umi-plugins/dist/open-api')],
  npmClient: 'pnpm',
  proxy: {
    '/catering': {
      target: 'http://10.162.26.212:8080/',
      changeOrigin: true,
      secure: false,
    },
  }
});

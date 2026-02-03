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
      component: './Home',
    },
  ],
  mfsu: false,
  plugins: [require.resolve('@creekjs/umi-plugins/dist/creek-layout'), require.resolve('@creekjs/umi-plugins/dist/open-api')],
  npmClient: 'pnpm',
});

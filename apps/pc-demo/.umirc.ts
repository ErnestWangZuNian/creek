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
  mako: {},
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: '首页',
      component: './Demo',
      routes: [
        {
          path: '/home/:id',
          name: '宠物详情',
          component: './DemoDetail',
          hideInMenu: true,
        },
      ],
    },
    {
      path: '/test',
      name: '更新测试',
      component: './Test',
    },
  ],
  mfsu: false,
  monorepoRedirect: {},
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

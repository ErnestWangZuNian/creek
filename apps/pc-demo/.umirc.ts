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
  // vite: {
  //   server: {
  //     watch: {
  //       usePolling: true,
  //       ignored: ['!**/packages/**']
  //     }
  //   },
  //   // 将 components 包从预构建依赖中排除，让 Vite 将其当做源码处理
  //   optimizeDeps: {
  //     exclude: ['@creekjs/web-components', '@creekjs/i18n', '@creekjs/cache', '@creekjs/request', '@creekjs/openapi', '@creekjs/umi-plugins']
  //   }
  // },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: '首页',
      component: './Demo',
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

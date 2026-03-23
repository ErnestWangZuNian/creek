import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'CreekJS',
    logo: '/logo.svg',
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/creek-table', activePath: '/components' },
      { title: '生态', link: '/packages' },
    ],
    sidebar: {
      '/guide': [
        {
          title: '基础',
          children: [
            { title: '快速开始', link: '/guide' },
            { title: '代码规范 (@creekjs/lint)', link: '/guide/lint' },
            { title: '网络请求 (@creekjs/request)', link: '/guide/request' },
            { title: '接口生成 (@creekjs/openapi)', link: '/guide/openapi' },
          ],
        },
        {
          title: '高阶',
          children: [
            { title: '全局多语言 (@creekjs/i18n)', link: '/guide/i18n' },
          ],
        },
      ],
    },
  },
});

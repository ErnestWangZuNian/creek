import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'CreekJS',
    logo: '/logo.svg',
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components' },
      { title: '生态', link: '/packages' },
    ],
  },
});

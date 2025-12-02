

import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    input: 'src',
    output: 'dist'
  },
  // 开发模式下不 clean，避免并行启动时 dist 被删除导致依赖报错
  sourcemap: true,
});

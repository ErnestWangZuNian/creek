import { defineConfig } from 'father';
const path = require('path');

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});

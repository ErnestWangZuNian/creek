const path = require('path');

import { defineConfig } from 'father';

export default defineConfig({
  extends: '../../.fatherrc.base.ts',
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});

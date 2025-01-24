const path = require('path');

import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    input: 'src',
    output: 'dist'
  },
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});

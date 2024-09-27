const path = require('path');

import { defineConfig } from 'father';

export default defineConfig({
  esm: {
    input: 'src',
  },
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});

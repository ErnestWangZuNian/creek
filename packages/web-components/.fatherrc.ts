
import { defineConfig } from 'father';
const path = require('path');

export default defineConfig({
  esm: {
    input: 'src',
    output: 'dist'
  },
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
});

module.exports = {
  printWidth: 200,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [
    { files: '.prettierrc', options: { parser: 'json' } },
    {
      files: '*.tpl',
      options: { parser: 'html' },
    },
  ],
  plugins: [require.resolve('prettier-plugin-packagejson'), require.resolve('prettier-plugin-organize-imports')],
  pluginSearchDirs: false,
};

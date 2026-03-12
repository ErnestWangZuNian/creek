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
  plugins: [require.resolve('prettier-plugin-packagejson'), require.resolve('@trivago/prettier-plugin-sort-imports')],
  importOrder: [
    "^(react|react-dom|antd|@ant-design|ahooks|axios|lodash|@umijs)(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^@creekjs/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

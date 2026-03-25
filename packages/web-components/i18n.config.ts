module.exports = {
  // 语言文件类型 (ts/js/json)
  localeFileType: 'ts',
  
  // 语言包输出的主入口文件路径
  // 注意：实际生成的翻译文件会存放在该文件同级目录下以文件名命名的文件夹中
  // 例如：src/locales/zh_CN.ts -> 生成的文件在 src/locales/zh_CN/ 目录下
  localePath: './src/locales/zh_CN.ts',
  
  // 要扫描的文件路径 (Glob)
  path: 'src/**/*.{ts,tsx,js,jsx}',
  
  // 排除的文件/目录
  exclude: ['**/node_modules/**', '**/dist/**', '**/.umi/**', '**/locales/**'],
  
  // 国际化函数名称 (默认为 't')
  tFunction: 't',
  
  // 国际化函数的导入语句
  importStatement: "import { t } from '@creekjs/i18n/react'",
  
  // 是否使用目录结构作为命名空间 (默认为 true)
  useDirectoryAsNamespace: false,
  
  // 开启 React Hooks 模式 (useT)
  useT: true,
  
  // useT 的导入语句
  useTImportStatement: "import { useT } from '@creekjs/i18n/react'",
};

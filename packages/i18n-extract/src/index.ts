import { program } from 'commander';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';
// @ts-ignore
import chalk from 'chalk';
import { resolveConfig } from './config';
import { exportExcel } from './core/excel';
import { generateLocales } from './core/generator';
import { processFile } from './core/parser';
import { CollectedLocales } from './types';
export * from './types';

const initConfigTemplate = `import { UserConfig } from '@creekjs/i18n-extract';

const config: UserConfig = {
  // 语言文件类型 (ts/js/json)
  localeFileType: 'ts',1
  
  // 语言包输出的主入口文件路径
  // 注意：实际生成的翻译文件会存放在该文件同级目录下以文件名命名的文件夹中
  // 例如：src/locales/zh-CN.ts -> 生成的文件在 src/locales/zh-CN/ 目录下
  localePath: './src/locales/zh-CN.ts',
  
  // 要扫描的文件路径 (Glob)
  path: 'src/**/*.{ts,tsx,js,jsx,vue}',
  
  // 排除的文件/目录
  exclude: ['**/node_modules/**', '**/dist/**', '**/.umi/**', '**/locales/**'],
  
  // 国际化函数名称 (默认为 't')
  tFunction: 't',
  
  // 国际化函数的导入语句
  importStatement: 'import { t } from "@/utils/i18n"',
  
  // 是否使用目录结构作为命名空间 (默认为 false)
  // 开启后，生成的语言文件将镜像源码目录结构
  useDirectoryAsNamespace: false,
  
  // 自定义 key 生成规则 (可选)
  // text: 中文原文
  // filePath: 当前文件路径
  // customizeKey: (text, filePath) => {
  //   return someHashFunction(text); 
  // }
  
  // 开启 React Hooks 模式 (useT)
  // 默认为 true
  useT: true,

  // 指定哪些目录下的文件使用 useT 模式
  // 默认为 ['pages', 'components']
  // 只有在这些目录下的文件，并且是 React 组件或 Hook 时，才会注入 useT
  useTDirs: ['pages', 'components'],

  // useT 的 Hook 名称
  // 默认为 'useT'
  useTFunction: 'useT',

  // useT 的导入语句
  // 默认为 'import { useT } from "@/utils/i18n"'
  useTImportStatement: 'import { useT } from "@/utils/i18n"',
};

export default config;
`;

program
  .version('1.0.0');

program
  .command('init')
  .description('Initialize config file')
  .action(async () => {
    const configPath = path.resolve(process.cwd(), 'i18n.config.ts');
    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow('i18n.config.ts already exists.'));
      return;
    }
    await fs.writeFile(configPath, initConfigTemplate, 'utf-8');
    console.log(chalk.green('Created i18n.config.ts'));
  });

program
  .command('scan', { isDefault: true })
  .description('Scan and extract i18n keys')
  .option('-p, --path <path>', 'Path to source files')
  .option('-o, --out <path>', 'Output directory for locale files')
  .option('-c, --config <path>', 'Path to config file')
  .option('--excel <path>', 'Path to export excel file')
  .action(async (options) => {
    await run(options);
  });

program.parse(process.argv);

async function run(options: any) {
  const config = resolveConfig(options);

  const files = glob.sync(config.path, {
    ignore: config.exclude,
  });

  console.log(chalk.blue(`Found ${files.length} files to scan...`));

  // Global collection of locales
  const collectedLocales: CollectedLocales = {};

  for (const file of files) {
    try {
      await processFile(file, config, collectedLocales);
    } catch (error) {
      console.error(chalk.red(`Error processing ${file}:`), error);
    }
  }

  // Generate Locale Files
  await generateLocales(collectedLocales, config);

  // Export to Excel
  if (config.excelPath) {
    exportExcel(collectedLocales, config.excelPath);
  }
}


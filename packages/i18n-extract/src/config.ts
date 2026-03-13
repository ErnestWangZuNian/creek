import fs from 'fs-extra';
import jiti from 'jiti';
import path from 'path';
// @ts-ignore
import chalk from 'chalk';
import { Config } from './types';
import { defaultCustomizeKey } from './utils';

const loadConfig = jiti(__filename);

export const defaultConfig: Config = {
  localeFileType: 'ts',
  localePath: './src/locales/zh-CN.ts',
  path: 'src/**/*.{ts,tsx,js,jsx,vue}',
  exclude: ['**/node_modules/**', '**/dist/**', '**/.umi/**', '**/locales/**'],
  tFunction: 't',
  importStatement: 'import { t } from "@/utils/i18n"',
  customizeKey: (text: string, filePath?: string) => {
    // Default strategy: file path prefix + pinyin
    const pinyinKey = defaultCustomizeKey(text);
    if (filePath) {
        const relativePath = path.relative(process.cwd(), filePath);
        const parsed = path.parse(relativePath);
        const cleanNs = path.join(parsed.dir, parsed.name);
        // e.g. src/pages/Demo/index -> src.pages.Demo.index
        const prefix = cleanNs.split(path.sep).join('.').replace(/^src\./, '');
        return `${prefix}.${pinyinKey}`;
    }
    return pinyinKey;
  },
  useDirectoryAsNamespace: false,
  useT: true,
  useTDirs: ['pages', 'components'],
  useTFunction: 'useT',
  useTImportStatement: 'import { useT } from "@/utils/i18n"',
};

export function resolveConfig(cliOptions: any): Config {
    let userConfig: Partial<Config> = {};
    const configPath = cliOptions.config 
      ? path.resolve(process.cwd(), cliOptions.config) 
      : path.resolve(process.cwd(), 'i18n.config.ts');
    
    const jsConfigPath = cliOptions.config
      ? path.resolve(process.cwd(), cliOptions.config)
      : path.resolve(process.cwd(), 'i18n.config.js');

    if (fs.existsSync(configPath) && configPath.endsWith('.ts')) {
      try {
        const configModule = loadConfig(configPath);
        userConfig = configModule.default || configModule;
        console.log(chalk.blue(`Loaded config from ${configPath}`));
      } catch (error) {
        console.warn(chalk.yellow(`Failed to load config from ${configPath}, using defaults.`));
      }
    } else if (fs.existsSync(jsConfigPath)) {
      try {
        const configModule = loadConfig(jsConfigPath);
        userConfig = configModule.default || configModule;
        console.log(chalk.blue(`Loaded config from ${jsConfigPath}`));
      } catch (error) {
        console.warn(chalk.yellow(`Failed to load config from ${jsConfigPath}, using defaults.`));
      }
    }

    return {
      ...defaultConfig,
      ...userConfig,
      path: cliOptions.path || userConfig.path || defaultConfig.path,
      localePath: cliOptions.out
        ? path.join(cliOptions.out, 'zh-CN.ts')
        : userConfig.localePath || defaultConfig.localePath,
      excelPath: cliOptions.excel || userConfig.excelPath,
    };
}

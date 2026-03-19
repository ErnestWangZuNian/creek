export interface Config {
  localeFileType: string;
  localePath: string;
  path: string;
  exclude: string[];
  tFunction: string;
  importStatement: string;
  customizeKey: (text: string, filePath: string) => string;
  excelPath?: string;
  useDirectoryAsNamespace?: boolean;
  useT?: boolean;
  useTDirs?: string[];
  useTFunction?: string;
  useTImportStatement?: string;
  extractMenus?: string; // Route config file path, e.g., '.umirc.ts' or 'config/routes.ts'
}

export type UserConfig = Partial<Config>;

export type CollectedLocales = Record<string, Record<string, string>>;

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
}

export type CollectedLocales = Record<string, Record<string, string>>;

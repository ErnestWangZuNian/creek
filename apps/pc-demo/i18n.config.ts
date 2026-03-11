module.exports = {
  localeFileType: 'ts',
  localePath: './src/locales/zh-CN.ts',
  rules: {
    tsx: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
    ts: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
    js: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
    mjs: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
    jsx: {
      importDeclaration: 'import { t } from "@/utils/i18n"',
    },
  },
};

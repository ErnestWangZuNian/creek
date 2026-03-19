import { initI18n } from '@creekjs/i18n/react';
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';

const locales: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

initI18n('zh-CN', locales);

export { getIntl, getLocale, setLocale, t, useT, globalIntl } from '@creekjs/i18n/react';

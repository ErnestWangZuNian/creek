import { initI18n } from '@creekjs/i18n/react';
import enUS from '../locales/en_US';
import zhCN from '../locales/zh_CN';

const locales: Record<string, Record<string, string>> = {
  zh_CN: zhCN,
  en_US: enUS,
};

initI18n('zh_CN', locales);

export { getIntl, getLocale, globalIntl, setLocale, t, useT } from '@creekjs/i18n/react';


import { createIntl, createIntlCache, useIntl } from 'react-intl';
import zhCN from '../locales/zh-CN';
import enUS from '../locales/en-US';

const cache = createIntlCache();

export let globalIntl = createIntl(
  {
    locale: 'zh-CN',
    messages: zhCN,
  },
  cache,
);

const locales: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const setLocale = (locale: string, reload?: boolean) => {
  globalIntl = createIntl(
    {
      locale,
      messages: locales[locale] || zhCN,
    },
    cache,
  );
  if (reload !== false) {
    window.location.reload();
  }
};

export const getLocale = () => {
  return globalIntl.locale;
};

export const getIntl = () => {
  return globalIntl;
};

export function t(key: string = '', defaultMessage?: string) {
  return globalIntl.formatMessage({
    id: key,
    defaultMessage,
  });
}

export function useT() {
  const intl = useIntl();
  return (key: string = '', defaultMessage?: string) => {
    return intl.formatMessage({
      id: key,
      defaultMessage,
    });
  };
}

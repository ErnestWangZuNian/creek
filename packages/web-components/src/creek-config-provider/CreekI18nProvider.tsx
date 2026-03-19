import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { IntlContext, IntlProvider, getIntl, getLocale, setLocale, setLocaleMessages } from '@creekjs/i18n/react';

import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';

const DEFAULT_LOCALE = 'zh-CN';

export interface CreekI18nProviderProps {
  children?: ReactNode;
  /**
   * 语言标识
   * @default 'zh-CN'
   */
  locale?: string;
  /**
   * 国际化语言包，透传给 react-intl
   */
  messages?: Record<string, string>;
}

const MESSAGES_MAP: Record<string, Record<string, string>> = {
  [DEFAULT_LOCALE]: zhCN,
  'en-US': enUS,
};

export const LocaleContext = createContext({
  locale: getLocale() || DEFAULT_LOCALE,
  changeLocale: (lang: string) => {},
});

export const useAppLocale = () => useContext(LocaleContext);

export const CreekI18nProvider = (props: CreekI18nProviderProps) => {
  const { children, locale, messages } = props;

  // Try to get parent intl context
  const parentIntl = useContext(IntlContext);

  const [intl, setIntl] = useState(() => getIntl());

  const changeLocale = useCallback((lang: string) => {
    setLocale(lang, false);
    setIntl(getIntl());
  }, []);

  // 1. 确定最终生效的 locale
  // 优先级：当前组件内部的 state > props.locale > parentIntl.locale > 全局默认
  const currentLocale = intl?.locale || locale || parentIntl?.locale || DEFAULT_LOCALE;

  // 2. 提取父级上下文的安全配置 (避免将 IntlShape 的内部方法直接传给 IntlProvider)
  const intlConfig = parentIntl || intl || {};
  const safeConfig = {
    formats: intlConfig.formats,
    defaultLocale: intlConfig.defaultLocale,
    defaultFormats: intlConfig.defaultFormats,
    onError: intlConfig.onError,
  };

  // 3. 确定最终的 messages
  // 避免使用 stale 的 parentIntl.messages
  let baseMessages = {};
  if (parentIntl && parentIntl.locale === currentLocale) {
    baseMessages = parentIntl.messages;
  } else {
    baseMessages = getIntl()?.messages || {};
  }

  const finalMessages = {
    ...baseMessages,
    ...(MESSAGES_MAP[currentLocale] || zhCN),
    ...(messages || {}),
  };

  // 4. 同步给全局 globalIntl，确保非 React 组件能够拿到
  useEffect(() => {
    setLocaleMessages(currentLocale, finalMessages);
  }, [currentLocale, finalMessages]);

  return (
    <IntlProvider {...safeConfig} locale={currentLocale} messages={finalMessages}>
      <LocaleContext.Provider value={{ locale: currentLocale, changeLocale }}>{children}</LocaleContext.Provider>
    </IntlProvider>
  );
};

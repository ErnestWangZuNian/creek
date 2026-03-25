import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { IntlContext, IntlProvider, appLocales, getIntl, getLocale, setLocale, setLocaleMessages } from '@creekjs/i18n/react';

import enUS from '../locales/en_US';
import zhCN from '../locales/zh_CN';

const DEFAULT_LOCALE = 'zh_CN';

export type LocaleCode = 'en_US' | 'zh_CN';

const SUPPORTED_LOCALES: LocaleCode[] = ['zh_CN', 'en_US'];

const toUnderscoreLocale = (input?: string): LocaleCode => {
  if (!input) return DEFAULT_LOCALE;
  const normalized = input.replace('-', '_') as LocaleCode;
  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
};

export interface CreekI18nProviderProps {
  children?: ReactNode;
  /**
   * 语言标识
   * @default 'zh_CN'
   */
  locale?: LocaleCode;
  /**
   * 国际化语言包，透传给 react-intl
   */
  messages?: Record<string, string>;
}

const MESSAGES_MAP: Record<LocaleCode, Record<string, string>> = {
  zh_CN: zhCN,
  en_US: enUS,
};

export const LocaleContext = createContext({
  locale: toUnderscoreLocale(getLocale()),
  changeLocale: (lang: string) => {},
});

export const useAppLocale = () => useContext(LocaleContext);

export const CreekI18nProvider = (props: CreekI18nProviderProps) => {
  const { children, locale, messages } = props;

  // 获取父级 intl context
  const parentIntl = useContext(IntlContext);

  // 内部维护的 locale 状态，仅在调用 changeLocale 时更新
  const [internalLocale, setInternalLocale] = useState<string>();

  const changeLocale = useCallback((lang: string) => {
    const underscore = toUnderscoreLocale(lang);
    setLocale(underscore, false);
    setInternalLocale(underscore);
  }, []);

  // 1. 确定最终生效的 locale
  // 优先级：当前组件内部的 state > props.locale > parentIntl.locale > 全局默认
  const currentLocale = useMemo(() => {
    const rawLocale = internalLocale || locale || parentIntl?.locale || getIntl()?.locale || DEFAULT_LOCALE;
    return toUnderscoreLocale(rawLocale);
  }, [internalLocale, locale, parentIntl?.locale]);

  // 2. 提取父级上下文的安全配置 (避免将 IntlShape 的内部方法直接传给 IntlProvider)
  const safeConfig = useMemo(() => {
    const intlConfig = parentIntl || getIntl() || {};
    return {
      formats: intlConfig.formats,
      defaultLocale: intlConfig.defaultLocale,
      defaultFormats: intlConfig.defaultFormats,
      onError: intlConfig.onError,
    };
  }, [parentIntl]);

  // 3. 确定最终的 messages
  // 避免使用 stale 的 parentIntl.messages
  const finalMessages = useMemo(() => {
    let baseMessages: Record<string, any> = {};
    if (parentIntl && parentIntl.locale === currentLocale.replace('_', '-')) {
      baseMessages = parentIntl.messages;
    } else {
      // 优先从 appLocales 中获取对应语言的 messages
      baseMessages = appLocales?.[currentLocale] || getIntl()?.messages || {};
    }

    return {
      ...baseMessages,
      ...(MESSAGES_MAP[currentLocale] || zhCN),
      ...(messages || {}),
    };
  }, [parentIntl, currentLocale, messages]);

  // 4. 同步给全局 globalIntl，确保非 React 组件能够拿到
  useEffect(() => {
    setLocaleMessages(currentLocale, finalMessages);
  }, [currentLocale, finalMessages]);

  const contextValue = useMemo(
    () => ({
      locale: currentLocale,
      changeLocale,
    }),
    [currentLocale, changeLocale],
  );

  return (
    <IntlProvider {...safeConfig} locale={currentLocale.replace('_', '-')} messages={finalMessages}>
      <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
    </IntlProvider>
  );
};

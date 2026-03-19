import type { ConfigProviderProps } from 'antd';
import { App, ConfigProvider } from 'antd';
import enUS_antd from 'antd/locale/en_US';
import zhCN_antd from 'antd/locale/zh_CN';

import { AppProvider } from '../creek-hooks';
import { CreekConfigContext, CreekConfigContextProps } from './CreekConfigContext';
import { CreekI18nProvider, CreekI18nProviderProps, LocaleContext, useAppLocale } from './CreekI18nProvider';

export type CreekConfigProviderProps = CreekConfigContextProps & Omit<ConfigProviderProps, 'locale'> & CreekI18nProviderProps;

export { CreekI18nProvider, LocaleContext, useAppLocale };
export type { CreekI18nProviderProps };

const InnerConfigProvider = (props: Omit<CreekConfigProviderProps, 'locale' | 'messages'>) => {
  const { children, ...more } = props;
  const { locale } = useAppLocale();

  return (
    <ConfigProvider
      locale={locale === 'en-US' ? enUS_antd : zhCN_antd}
      {...more}
    >
      <CreekConfigContext.Provider value={more as any}>
        <App>
          <AppProvider>
            {children}
          </AppProvider>
        </App>
      </CreekConfigContext.Provider>
    </ConfigProvider>
  );
};

export const CreekConfigProvider = (props: CreekConfigProviderProps) => {
  const { children, locale, messages, ...more } = props;

  return (
    <CreekI18nProvider locale={locale} messages={messages}>
      <InnerConfigProvider {...more}>
        {children}
      </InnerConfigProvider>
    </CreekI18nProvider>
  );
};

CreekConfigProvider.CreekConfigContext = CreekConfigContext;

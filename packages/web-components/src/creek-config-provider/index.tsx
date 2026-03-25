import type { ConfigProviderProps } from 'antd';
import { App, ConfigProvider } from 'antd';
import enUS_antd from 'antd/locale/en_US';
import zhCN_antd from 'antd/locale/zh_CN';
import merge from 'lodash/merge';

import { AppProvider } from '../creek-hooks';
import { useLayoutSettingsStore } from '../creek-layout/useLayoutSettingsStore';
import { CreekConfigContext, CreekConfigContextProps } from './CreekConfigContext';
import { CreekI18nProvider, CreekI18nProviderProps, LocaleCode, LocaleContext, useAppLocale } from './CreekI18nProvider';

const ANTD_LOCALE_MAP: Record<LocaleCode, any> = {
  zh_CN: zhCN_antd,
  en_US: enUS_antd,
};

export type CreekConfigProviderProps = CreekConfigContextProps & Omit<ConfigProviderProps, 'locale'> & CreekI18nProviderProps;

export { CreekI18nProvider, LocaleContext, useAppLocale };
export type { CreekI18nProviderProps };

const InnerConfigProvider = (props: Omit<CreekConfigProviderProps, 'locale' | 'messages'>) => {
  const { children, theme, ...more } = props;
  const { locale } = useAppLocale();
  const settingsStore = useLayoutSettingsStore();

  const activeColorPrimary = settingsStore.colorPrimary || theme?.token?.colorPrimary;

  let finalTheme = merge(
    {},
    theme,
    activeColorPrimary
      ? {
          token: {
            colorPrimary: activeColorPrimary,
            colorLink: activeColorPrimary,
            colorLinkHover: activeColorPrimary,
            colorLinkActive: activeColorPrimary,
          },
        }
      : {},
  );

  return (
    <ConfigProvider locale={ANTD_LOCALE_MAP[locale] || zhCN_antd} theme={finalTheme} {...more}>
      <CreekConfigContext.Provider value={more as any}>
        <App>
          <AppProvider>{children}</AppProvider>
        </App>
      </CreekConfigContext.Provider>
    </ConfigProvider>
  );
};

export const CreekConfigProvider = (props: CreekConfigProviderProps) => {
  const { children, locale, messages, ...more } = props;

  return (
    <CreekI18nProvider locale={locale} messages={messages}>
      <InnerConfigProvider {...more}>{children}</InnerConfigProvider>
    </CreekI18nProvider>
  );
};

CreekConfigProvider.CreekConfigContext = CreekConfigContext;

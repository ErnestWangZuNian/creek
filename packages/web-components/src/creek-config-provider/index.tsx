import { useContext } from 'react';
import { IntlContext, IntlProvider } from 'react-intl';
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';
import { CreekConfigContext, CreekConfigContextProps } from './CreekConfigContext';

export type CreekConfigProviderProps = CreekConfigContextProps & {
  children?: React.ReactNode;
  /**
   * 语言标识
   * @default 'zh-CN'
   */
  locale?: string;
  /**
   * 国际化语言包，透传给 react-intl
   */
  messages?: Record<string, string>;
};

const MESSAGES_MAP: Record<string, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const CreekConfigProvider = (props: CreekConfigProviderProps) => {
  const { children, locale, messages, ...more } = props;
  
  // Try to get parent intl context
  const parentIntl = useContext(IntlContext);
  
  // Resolve locale: prop > parent > default
  const finalLocale = locale || parentIntl?.locale || 'zh-CN';
  
  // Resolve messages: merge component messages with parent messages and explicit prop
  const finalMessages = {
    ...(MESSAGES_MAP[finalLocale] || zhCN),
    ...(parentIntl?.messages as Record<string, string> || {}),
    ...(messages || {})
  };
  
  return (
    <IntlProvider locale={finalLocale} messages={finalMessages}>
      <CreekConfigContext.Provider value={more}>{children}</CreekConfigContext.Provider>
    </IntlProvider>
  );
};

CreekConfigProvider.CreekConfigContext = CreekConfigContext;

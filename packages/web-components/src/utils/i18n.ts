import { createIntl, createIntlCache, useIntl } from 'react-intl';
import zhCN from '../locales/zh-CN';

const cache = createIntlCache();

let globalIntl = createIntl(
  {
    locale: 'zh-CN',
    messages: zhCN,
  },
  cache,
);

/**
 * 设置全局国际化实例
 * @param locale 语言标识
 * @param messages 消息对象
 */
export const setLocaleMessages = (locale: string, messages: Record<string, string>) => {
  globalIntl = createIntl(
    {
      locale,
      messages,
    },
    cache,
  );
};

/**
 * 国际化函数 (静态)
 * @param id 键
 * @param defaultMessage 默认消息
 */
export const t = (id: string, defaultMessage?: string) => {
  return globalIntl.formatMessage({ id, defaultMessage });
};

/**
 * 国际化 Hook
 */
export const useT = () => {
  let intl;
  try {
    intl = useIntl();
  } catch (error) {
    // Fallback to globalIntl if <IntlProvider> is not present in the component tree
    intl = globalIntl;
  }

  return (id: string, defaultMessage?: string) => {
    return intl.formatMessage({ id, defaultMessage });
  };
};

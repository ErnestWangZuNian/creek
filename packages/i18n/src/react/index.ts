import { createIntl, createIntlCache, IntlShape, useIntl, IntlProvider, IntlContext, RawIntlProvider } from 'react-intl';

const cache = createIntlCache();

export { IntlProvider, IntlContext, RawIntlProvider };

export let globalIntl: IntlShape;
export let appLocales: Record<string, Record<string, string>> = {};

/**
 * Initialize i18n instance
 */
export const initI18n = (defaultLocale: string, messages: Record<string, Record<string, string>>) => {
  appLocales = messages;
  globalIntl = createIntl(
    {
      locale: defaultLocale,
      messages: appLocales[defaultLocale] || {},
    },
    cache,
  );
};

/**
 * Update current locale and reload if needed
 */
export const setLocale = (locale: string, reload?: boolean) => {
  if (!globalIntl) {
    console.warn('Please call initI18n first');
    return;
  }
  globalIntl = createIntl(
    {
      locale,
      messages: appLocales[locale] || {},
    },
    cache,
  );
  if (reload !== false) {
    window.location.reload();
  }
};

/**
 * Set messages directly for a given locale (useful for component libraries)
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

export const getLocale = () => {
  return globalIntl?.locale;
};

export const getIntl = () => {
  return globalIntl;
};

export function t(key: string = '', defaultMessage?: string) {
  if (!globalIntl) {
    return defaultMessage || key;
  }
  return globalIntl.formatMessage({
    id: key,
    defaultMessage,
  });
}

export function useT() {
  let intl: IntlShape | undefined;
  try {
    intl = useIntl();
  } catch (error) {
    // Fallback to globalIntl if <IntlProvider> is not present in the component tree
    intl = globalIntl;
  }
  return (key: string = '', defaultMessage?: string) => {
    if (!intl) return defaultMessage || key;
    return intl.formatMessage({
      id: key,
      defaultMessage,
    });
  };
}

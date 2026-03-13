import { getIntl, useIntl } from '@umijs/max';

export function t(key: string = '', defaultMessage?: string) {
  const intl = getIntl();
  return intl.formatMessage({
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

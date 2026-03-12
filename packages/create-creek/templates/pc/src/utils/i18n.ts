import { getIntl } from '@umijs/max';

export function t(key: string = '', defaultMessage?: string) {
  const intl = getIntl();
  return intl.formatMessage({
    id: key,
    defaultMessage,
  });
}

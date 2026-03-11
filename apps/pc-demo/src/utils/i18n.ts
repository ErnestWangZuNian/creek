import { getIntl } from '@umijs/max';

export function t(key: string, params: Record<string, string> = {}) {
  const intl = getIntl();
  return intl.formatMessage(
    {
      id: key,
    },
    params,
  );
}
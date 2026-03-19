import { Button } from 'antd';

import { useT } from '@creekjs/i18n/react';
import { useAppLocale } from '../creek-config-provider';

export const CreekLocaleButton = () => {
  const t = useT();
  const { locale, changeLocale } = useAppLocale();

  const handleLanguageChange = () => {
    const nextLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    changeLocale(nextLocale);
  };

  return (
    <Button key="change-language" onClick={handleLanguageChange}>
      {t('creek-locale-button.qieHuanYuYan', '切换语言')}
    </Button>
  );
};

import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown, Space, Typography } from 'antd';

import { useT } from '@creekjs/i18n/react';

import { useAppLocale } from '../creek-config-provider';

export const CreekLocaleButton = () => {
  const t = useT();

  const { locale, changeLocale } = useAppLocale();

  const items = [
    {
      key: 'zh-CN',
      label: t('creek-locale-button.index.jianTiZhongWen', '简体中文'),
      disabled: locale === 'zh-CN',
    },
    {
      key: 'en-US',
      label: 'English',
      disabled: locale === 'en-US',
    },
  ];

  const currentLabel = items.find((item) => item.key === locale)?.label || 'Language';

  return (
    <Dropdown
      menu={{
        items,
        onClick: (e) => changeLocale(e.key),
      }}
      placement="bottomRight"
    >
      <Space size="small" align="center">
        <GlobalOutlined />
        <Typography.Text>{currentLabel}</Typography.Text>
      </Space>
    </Dropdown>
  );
};

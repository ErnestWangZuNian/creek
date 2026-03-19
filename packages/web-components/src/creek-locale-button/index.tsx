import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown, Space, Typography } from 'antd';

import { useAppLocale } from '../creek-config-provider';


export const CreekLocaleButton = () => {
  const { locale, changeLocale } = useAppLocale();

  const items = [
    {
      key: 'zh-CN',
      label: '简体中文',
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
        <Typography.Text >{currentLabel}</Typography.Text>
      </Space>
    </Dropdown>
  );
};

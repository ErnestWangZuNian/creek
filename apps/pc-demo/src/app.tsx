// 运行时配置
import { RawIntlProvider, RunTimeLayoutConfig, getIntl, getLocale, setLocale } from '@umijs/max';
import { App, Button, ConfigProvider } from 'antd';
import React, { useEffect, useState } from 'react';

import { AppProvider } from '@creekjs/web-components';

import { t } from '@/utils/i18n';

import { initRequest } from './request';

const IntlWrapper = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState(getLocale());

  useEffect(() => {
    const handler = () => {
      setLocaleState(getLocale());
    };
    window.addEventListener('creek-locale-change', handler);
    return () => {
      window.removeEventListener('creek-locale-change', handler);
    };
  }, []);

  const intl = getIntl(locale);

  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        token: {
          colorPrimary: '#00c07f',
        },
      }}
    >
      <RawIntlProvider value={intl}>{children}</RawIntlProvider>
    </ConfigProvider>
  );
};

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

//  布局
export const layout: RunTimeLayoutConfig = () => {
  const changeLanguage = () => {
    const currentLocal = getLocale();

    console.log(currentLocal, 'currentLocal');

    setLocale(currentLocal === 'zh-CN' ? 'en-US' : 'zh-CN', false);
    window.dispatchEvent(new Event('creek-locale-change'));
  };

  return {
    keepAlive: false,
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    layout: 'mix',
    iconFontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
    extraActions: [
      <Button key="change-language" onClick={changeLanguage}>
        {t('app.qieHuanYuYan', '切换语言')}
      </Button>,
    ],
  };
};

// 全局配置
export const rootContainer = (children: React.ReactNode) => {
  return (
    <IntlWrapper>
      <App>
        <AppProvider>{children}</AppProvider>
      </App>
    </IntlWrapper>
  );
};

// 请求配置
initRequest();

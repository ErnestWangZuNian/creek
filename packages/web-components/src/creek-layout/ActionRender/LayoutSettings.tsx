import { SettingOutlined } from '@ant-design/icons';
import { ColorPicker, Form, Switch, Tooltip } from 'antd';

import { useT } from '@creekjs/i18n/react';

import { useApp } from '../../creek-hooks';
import { useLayoutSettingsStore } from '../useLayoutSettingsStore';

const SettingsForm = ({
  defaultShowFullScreen,
  defaultShowLocaleButton,
}: {
  defaultShowFullScreen?: boolean;
  defaultShowLocaleButton?: boolean;
}) => {
  const t = useT();
  const { colorPrimary, showFullScreen, showLocaleButton, setSettings } = useLayoutSettingsStore();

  const currentShowFullScreen = showFullScreen ?? defaultShowFullScreen ?? false;
  const currentShowLocaleButton = showLocaleButton ?? defaultShowLocaleButton ?? true;

  return (
    <Form layout="vertical">
      <Form.Item label={t('creek-layout.ActionRender.LayoutSettings.themeColor', '主题色')}>
        <ColorPicker
          value={colorPrimary}
          onChange={(color, hex) => {
            setSettings({ colorPrimary: hex || undefined });
          }}
          allowClear
        />
      </Form.Item>
      <Form.Item label={t('creek-layout.ActionRender.LayoutSettings.showFullScreen', '展示全屏按钮')}>
        <Switch
          checked={currentShowFullScreen}
          onChange={(checked) => setSettings({ showFullScreen: checked })}
        />
      </Form.Item>
      <Form.Item label={t('creek-layout.ActionRender.LayoutSettings.showLocaleButton', '展示国际化按钮')}>
        <Switch
          checked={currentShowLocaleButton}
          onChange={(checked) => setSettings({ showLocaleButton: checked })}
        />
      </Form.Item>
    </Form>
  );
};

export const LayoutSettings = ({
  defaultShowFullScreen,
  defaultShowLocaleButton,
}: {
  defaultShowFullScreen?: boolean;
  defaultShowLocaleButton?: boolean;
}) => {
  const t = useT();
  const { drawer } = useApp();

  const handleOpenSettings = () => {
    drawer.open({
      title: t('creek-layout.ActionRender.LayoutSettings.title', '系统设置'),
      placement: 'right',
      size: 'default',
      content: (
        <SettingsForm
          defaultShowFullScreen={defaultShowFullScreen}
          defaultShowLocaleButton={defaultShowLocaleButton}
        />
      ),
    });
  };

  return (
    <Tooltip title={t('creek-layout.ActionRender.LayoutSettings.title', '系统设置')} placement="top">
      <SettingOutlined onClick={handleOpenSettings} />
    </Tooltip>
  );
};

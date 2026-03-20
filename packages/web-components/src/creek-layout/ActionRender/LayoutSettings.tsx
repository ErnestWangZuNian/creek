import { SettingOutlined } from '@ant-design/icons';
import { ColorPicker, Form, Switch, Tooltip } from 'antd';

import { useT } from '@creekjs/i18n/react';

import { useApp } from '../../creek-hooks';
import { useLayoutSettingsStore } from '../useLayoutSettingsStore';

const SettingsForm = ({ defaultShowFullScreen, defaultShowLocaleButton, defaultKeepAlive }: { defaultShowFullScreen?: boolean; defaultShowLocaleButton?: boolean; defaultKeepAlive?: boolean }) => {
  const t = useT();
  const { colorPrimary, showFullScreen, showLocaleButton, keepAlive, setSettings } = useLayoutSettingsStore();

  const currentShowFullScreen = showFullScreen ?? defaultShowFullScreen ?? false;
  const currentShowLocaleButton = showLocaleButton ?? defaultShowLocaleButton ?? true;
  const currentKeepAlive = keepAlive ?? defaultKeepAlive ?? true;

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
        <Switch checked={currentShowFullScreen} onChange={(checked) => setSettings({ showFullScreen: checked })} />
      </Form.Item>
      <Form.Item label={t('creek-layout.ActionRender.LayoutSettings.showLocaleButton', '展示国际化按钮')}>
        <Switch checked={currentShowLocaleButton} onChange={(checked) => setSettings({ showLocaleButton: checked })} />
      </Form.Item>
      <Form.Item label={t('creek-layout.ActionRender.LayoutSettings.keepAlive', '开启页面缓存 (Keep Alive)')}>
        <Switch checked={currentKeepAlive} onChange={(checked) => setSettings({ keepAlive: checked })} />
      </Form.Item>
    </Form>
  );

export const LayoutSettings = ({
  defaultShowFullScreen,
  defaultShowLocaleButton,
  defaultKeepAlive,
}: {
  defaultShowFullScreen?: boolean;
  defaultShowLocaleButton?: boolean;
  defaultKeepAlive?: boolean;
}) => {
  const t = useT();
  const { drawer } = useApp();

  const handleOpenSettings = () => {
    drawer.open({
      title: t('creek-layout.ActionRender.LayoutSettings.title', '系统设置'),
      placement: 'right',

      content: <SettingsForm defaultShowFullScreen={defaultShowFullScreen} defaultShowLocaleButton={defaultShowLocaleButton} defaultKeepAlive={defaultKeepAlive} />,
    });
  };

  return (
    <Tooltip title={t('creek-layout.ActionRender.LayoutSettings.title', '系统设置')} placement="top">
      <SettingOutlined onClick={handleOpenSettings} />
    </Tooltip>
  );
};

import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useFullscreen, useMemoizedFn } from 'ahooks';
import { Tooltip } from 'antd';

import { create } from 'zustand';

import { useT } from '@/utils/i18n';

export type FullScreenStore = {
  isFullScreen: boolean;
  changeFullScreen: () => void;
};

export const useFullScreenStore = create<FullScreenStore>((set, get) => {
  return {
    isFullScreen: false,
    changeFullScreen: () => {
      const _isFullScreen = get().isFullScreen;
      set({
        isFullScreen: !_isFullScreen,
      });
    },
  };
});

export const FullScreen = () => {
  const t = useT();
  const [, { toggleFullscreen }] = useFullscreen(document.body);

  const { isFullScreen, changeFullScreen } = useFullScreenStore.getState();

  const handleFullScreen = useMemoizedFn(() => {
    toggleFullscreen();
    changeFullScreen();
  });

  return (
    <>
      {isFullScreen ? (
        <Tooltip title={t('creek-layout.ActionRender.FullScreen.tuiChuQuanPing', '退出全屏')} placement="top">
          <FullscreenExitOutlined onClick={handleFullScreen} />
        </Tooltip>
      ) : (
        <Tooltip title={t('creek-layout.ActionRender.FullScreen.quanPing', '全屏')} placement="top">
          <FullscreenOutlined onClick={handleFullScreen} />
        </Tooltip>
      )}
    </>
  );
};

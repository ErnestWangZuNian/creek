import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { useFullscreen, useMemoizedFn } from "ahooks";
import { Tooltip } from "antd";
import { create } from "zustand";

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
  const [, { toggleFullscreen }] = useFullscreen(document.body);

  const { isFullScreen, changeFullScreen } = useFullScreenStore.getState();

  const handleFullScreen = useMemoizedFn(() => {
    toggleFullscreen();
    changeFullScreen();
  });

  return (
    <>
      {isFullScreen ? (
        <Tooltip title="退出全屏" placement="top">
          <FullscreenExitOutlined onClick={handleFullScreen} />
        </Tooltip>
      ) : (
        <Tooltip title="全屏" placement="top">
          <FullscreenOutlined onClick={handleFullScreen} />
        </Tooltip>
      )}
    </>
  );
};

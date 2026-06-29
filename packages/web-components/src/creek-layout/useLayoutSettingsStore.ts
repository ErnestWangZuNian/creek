import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutSettingsStore = {
  colorPrimary?: string;
  showFullScreen?: boolean;
  showLocaleButton?: boolean;
  keepAlive?: boolean;
  setSettings: (settings: Partial<LayoutSettingsStore>) => void;
};

export const useLayoutSettingsStore = create<LayoutSettingsStore>()(
  persist(
    (set) => ({
      colorPrimary: undefined,
      showFullScreen: undefined,
      showLocaleButton: undefined,
      keepAlive: undefined,
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'creek-layout-settings',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // 旧版本布尔默认值为 false，新版本改为 undefined
          // 清除旧版本的布尔类型字段，让外层配置优先生效
          return { ...persistedState, showFullScreen: undefined, showLocaleButton: undefined, keepAlive: undefined };
        }
        return persistedState;
      },
    }
  )
);

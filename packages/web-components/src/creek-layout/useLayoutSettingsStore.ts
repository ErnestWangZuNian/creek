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
      showFullScreen: true,
      showLocaleButton: true,
      keepAlive: true,
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'creek-layout-settings',
    }
  )
);

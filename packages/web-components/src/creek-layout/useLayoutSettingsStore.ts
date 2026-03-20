import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutSettingsStore = {
  colorPrimary?: string;
  showFullScreen?: boolean;
  showLocaleButton?: boolean;
  setSettings: (settings: Partial<LayoutSettingsStore>) => void;
};

export const useLayoutSettingsStore = create<LayoutSettingsStore>()(
  persist(
    (set) => ({
      colorPrimary: undefined,
      showFullScreen: undefined,
      showLocaleButton: undefined,
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'creek-layout-settings',
    }
  )
);

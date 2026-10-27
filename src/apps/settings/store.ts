import { create } from 'zustand';

export type SettingsTab = 'appearance' | 'time' | 'network' | 'about';

export const useSettingsStore = create<{ tab: SettingsTab; setTab: (tab: SettingsTab) => void }>((set) => ({
  tab: 'appearance',
  setTab: (tab) => set({ tab }),
}));

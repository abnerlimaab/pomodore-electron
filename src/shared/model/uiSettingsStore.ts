import { create } from 'zustand';

interface UiSettingsState {
  colorScheme: 'light' | 'dark';
  palette: string;
  railExpanded: boolean;

  setColorScheme: (scheme: 'light' | 'dark') => void;
  setPalette: (palette: string) => void;
  toggleRail: () => void;
}

export const useUiSettingsStore = create<UiSettingsState>()((set) => ({
  colorScheme: 'dark',
  palette: 'violeta',
  railExpanded: false,

  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  setPalette: (palette) => set({ palette }),
  toggleRail: () => set((s) => ({ railExpanded: !s.railExpanded })),
}));

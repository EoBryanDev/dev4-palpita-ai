import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));

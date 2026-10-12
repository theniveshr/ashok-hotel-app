import { create } from 'zustand';
import { type ThemeMode } from '@ashok-raj/ui';

/**
 * Theme store — permanently locked to Light Theme Only per requirements.
 */
interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>(() => ({
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
}));

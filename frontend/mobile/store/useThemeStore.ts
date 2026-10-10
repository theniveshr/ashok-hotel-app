import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ThemeMode } from '@ashok-raj/ui';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // Default to luxury dark mode for Ashok Raj
      setMode: (mode: ThemeMode) => set({ mode }),
      toggleMode: () => {
        const current = get().mode;
        const next = current === 'dark' ? 'light' : 'dark';
        set({ mode: next });
      },
    }),
    {
      name: 'ashok-raj-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

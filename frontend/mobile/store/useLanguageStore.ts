import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Language } from '@ashok-raj/types';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language: Language) => set({ language }),
      toggleLanguage: () =>
        set({ language: get().language === 'en' ? 'ta' : 'en' }),
    }),
    {
      name: 'ashok-raj-language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { useLanguageStore } from '../store/useLanguageStore';
import { type Language } from '@ashok-raj/types';

import { common as enCommon } from './en/common';
import { auth as enAuth } from './en/auth';
import { restaurant as enRestaurant } from './en/restaurant';
import { delivery as enDelivery } from './en/delivery';
import { lodge as enLodge } from './en/lodge';
import { settings as enSettings } from './en/settings';

import { common as taCommon } from './ta/common';
import { auth as taAuth } from './ta/auth';
import { restaurant as taRestaurant } from './ta/restaurant';
import { delivery as taDelivery } from './ta/delivery';
import { lodge as taLodge } from './ta/lodge';
import { settings as taSettings } from './ta/settings';

export const translations = {
  en: {
    common: enCommon,
    auth: enAuth,
    restaurant: enRestaurant,
    delivery: enDelivery,
    lodge: enLodge,
    settings: enSettings,
  },
  ta: {
    common: taCommon,
    auth: taAuth,
    restaurant: taRestaurant,
    delivery: taDelivery,
    lodge: taLodge,
    settings: taSettings,
  },
} as const;

export type TranslationResources = typeof translations.en;

export type PathsToFields<T> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? `${K & string}.${PathsToFields<T[K]> & string}`
    : `${K & string}`;
}[keyof T];

export type TranslationKey = PathsToFields<TranslationResources>;

export type TranslationParams = Record<string, string | number>;

/**
 * Pure translation function for non-React contexts or hooks
 */
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const parts = key.split('.');
  let current: any = translations[language] || translations.en;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English if translation is missing in selected language
      let fallback: any = translations.en;
      for (const fallbackPart of parts) {
        if (fallback && typeof fallback === 'object' && fallbackPart in fallback) {
          fallback = fallback[fallbackPart];
        } else {
          return key;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((str, [paramKey, value]) => {
      return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    }, current);
  }

  return current;
}

/**
 * Reactive hook for React components. Updates immediately on language change.
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  const t = (key: TranslationKey, params?: TranslationParams): string => {
    return translate(language, key, params);
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    isTamil: language === 'ta',
    isEnglish: language === 'en',
  };
}

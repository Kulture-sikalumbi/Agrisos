import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import type { AppLanguage, DiseaseKey, UiStrings } from './types';
import { LANGUAGE_OPTIONS } from './types';
import { en } from './en';
import { bem } from './bem';

const LANG_FILE = `${FileSystem.documentDirectory}agrisos-language.txt`;

const TABLES: Record<AppLanguage, UiStrings> = { en, bem };

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: UiStrings;
  options: typeof LANGUAGE_OPTIONS;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(LANG_FILE);
        if (info.exists) {
          const raw = (await FileSystem.readAsStringAsync(LANG_FILE)).trim();
          // English + Bemba only (legacy 'nya' falls back to English)
          if (raw === 'en' || raw === 'bem') {
            if (alive) setLanguageState(raw);
          }
        }
      } catch {
        // keep default
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    FileSystem.writeAsStringAsync(LANG_FILE, lang).catch(() => undefined);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: TABLES[language] ?? en,
      options: LANGUAGE_OPTIONS,
    }),
    [language, setLanguage]
  );

  // Avoid flash of wrong language on cold start
  if (!ready) return null;

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

export function useDiseaseInfo(key: DiseaseKey) {
  const { t } = useLanguage();
  return t.diseases[key];
}

export { LANGUAGE_OPTIONS };
export type { AppLanguage, DiseaseKey };

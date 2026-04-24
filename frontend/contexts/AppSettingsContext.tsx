import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import {
  ColorScheme,
  Palette,
  getPalette,
} from '@/constants/palettes';
import {
  loadPreferences,
  savePreferences,
  Preferences,
  Locale,
} from '@/services/preferences';
import { translate, isRTL } from '@/services/i18n';

type AppSettingsValue = {
  colorScheme: ColorScheme;
  locale: Locale;
  isDark: boolean;
  isRTL: boolean;
  palette: Palette;
  t: (key: string) => string;
  setColorScheme: (scheme: ColorScheme) => void;
  setLocale: (locale: Locale) => void;
};

const AppSettingsContext = createContext<AppSettingsValue | null>(null);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [prefs, setPrefs] = useState<Preferences>(() => {
    const initial = loadPreferences();
    const wantRtl = isRTL(initial.locale);
    if (I18nManager.isRTL !== wantRtl) {
      try {
        I18nManager.allowRTL(wantRtl);
        I18nManager.forceRTL(wantRtl);
      } catch {}
    }
    return initial;
  });

  const palette = useMemo(() => getPalette(prefs.colorScheme), [prefs.colorScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setPrefs((prev) => {
      const next = { ...prev, colorScheme: scheme };
      savePreferences(next);
      return next;
    });
  }, []);

  const setLocale = useCallback((locale: Locale) => {
    setPrefs((prev) => {
      const next = { ...prev, locale };
      savePreferences(next);
      const wantRtl = isRTL(locale);
      if (I18nManager.isRTL !== wantRtl) {
        try {
          I18nManager.allowRTL(wantRtl);
          I18nManager.forceRTL(wantRtl);
        } catch {}
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => translate(prefs.locale, key),
    [prefs.locale]
  );

  const value = useMemo<AppSettingsValue>(
    () => ({
      colorScheme: prefs.colorScheme,
      locale: prefs.locale,
      isDark: prefs.colorScheme === 'dark',
      isRTL: isRTL(prefs.locale),
      palette,
      t,
      setColorScheme,
      setLocale,
    }),
    [prefs.colorScheme, prefs.locale, palette, t, setColorScheme, setLocale]
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsValue => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used inside AppSettingsProvider');
  }
  return ctx;
};

export const useT = () => useAppSettings().t;
export const usePalette = () => useAppSettings().palette;

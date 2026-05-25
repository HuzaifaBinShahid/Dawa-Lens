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

// Keep the NATIVE layout direction permanently LTR so React Native's
// I18nManager never auto-flips flex layouts based on a persisted flag
// (which only updates after a full app restart). Visual RTL for Urdu is
// instead driven by the `direction` style on the root view in app/_layout.tsx,
// which updates instantly on locale change — no restart required.
try {
  I18nManager.allowRTL(false);
  if (I18nManager.isRTL) {
    I18nManager.forceRTL(false);
  }
} catch {}

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
  const [prefs, setPrefs] = useState<Preferences>(() => loadPreferences());

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
      // No I18nManager.forceRTL here — direction is handled by the `direction`
      // style in app/_layout.tsx, which re-renders instantly with this state.
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

import { File, Paths } from 'expo-file-system';
import type { ColorScheme } from '@/constants/palettes';

const FILE_NAME = 'user-preferences.json';

export type Locale = 'en' | 'ur';

export type Preferences = {
  colorScheme: ColorScheme;
  locale: Locale;
  onboardingComplete: boolean;
};

const DEFAULTS: Preferences = {
  colorScheme: 'light',
  locale: 'en',
  onboardingComplete: false,
};

const getFile = () => new File(Paths.document, FILE_NAME);

export const loadPreferences = (): Preferences => {
  try {
    const file = getFile();
    if (!file.exists) return { ...DEFAULTS };
    const raw = file.textSync();
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      colorScheme:
        parsed.colorScheme === 'dark' ? 'dark' : DEFAULTS.colorScheme,
      locale: parsed.locale === 'ur' ? 'ur' : DEFAULTS.locale,
      onboardingComplete: parsed.onboardingComplete === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
};

export const savePreferences = (prefs: Preferences): void => {
  try {
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(prefs));
  } catch {}
};

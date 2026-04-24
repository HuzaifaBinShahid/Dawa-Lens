import { Colors as LightColors } from './colors';

export type ColorScheme = 'light' | 'dark';

export type Palette = typeof LightColors;

export const lightPalette: Palette = LightColors;

export const darkPalette: Palette = {
  ...LightColors,
  background: '#0B0F1A',
  white: '#0F1420',
  cardBg: '#131a2c',
  inputBg: '#0F1420',
  inputBorder: 'rgba(148, 163, 184, 0.28)',
  grayBorder: 'rgba(148, 163, 184, 0.22)',
  grayLight: 'rgba(148, 163, 184, 0.14)',
  text: '#E2E8F0',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  tabInactive: '#64748B',
  primaryLight: 'rgba(1, 96, 184, 0.22)',
  warningBg: 'rgba(234, 88, 12, 0.15)',
  dangerBg: 'rgba(220, 38, 38, 0.18)',
  disclaimerBg: '#0F1420',
  disclaimerText: '#94A3B8',
};

export const getPalette = (scheme: ColorScheme): Palette =>
  scheme === 'dark' ? darkPalette : lightPalette;

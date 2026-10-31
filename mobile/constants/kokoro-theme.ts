import { Platform } from 'react-native';

export const palette = {
  canvas: '#F7F2E8',
  surface: '#FFFCF6',
  ink: '#292620',
  muted: '#746E65',
  line: '#D8CEC0',
  accent: '#B74635',
  accentSoft: '#F3DED6',
  gold: '#C58B37',
  goldSoft: '#F5E8C8',
  success: '#4E755B',
  successSoft: '#DFEADF',
  locked: '#C9C2B8',
  white: '#FFFFFF',
  danger: '#A84238',
};

export const type = {
  display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
  /**
   * Textbook-style (kyōkasho) kana, close to handwriting, so a kana the learner is shown has the
   * same shape as the one they trace. Klee One SemiBold, subset to hiragana and katakana (OFL).
   * Loaded in app/_layout.tsx.
   */
  kana: 'KleeOne-SemiBold',
};

export const KANA_FONT_ASSETS = {
  [type.kana]: require('../assets/fonts/KleeOne-SemiBold-kana.ttf'),
};

export const shadow = Platform.select({
  ios: {
    shadowColor: '#31271D',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 5 },
  default: { boxShadow: '0 8px 24px rgba(49, 39, 29, 0.12)' },
});

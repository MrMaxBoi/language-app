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

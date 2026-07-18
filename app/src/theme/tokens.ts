/** Design tokens del handoff — única fuente de verdad de estilos, ninguna pantalla debe hardcodear estos valores. */

export const colors = {
  navy: '#0A1F5C',
  navySecondary: '#123A8F',
  blueAccent: '#1E52C7',
  red: '#DA1E28',
  redDark: '#A3141C',
  green: '#1E9E5A',
  background: '#EEF1F8',
  surface: '#FFFFFF',
  textPrimary: '#0A1F5C',
  textSecondary: '#6B7599',
  textTertiary: '#9AA4C0',
  border: '#DBE1F0',
  separator: '#F0F2F8',
  trackBg: '#EEF1F8',
  trackBgAlt: '#E6EAF5',
  chipInfoBg: '#EEF1FB',
  chipInfoText: '#1E52C7',
  medicalBg: '#FFF5F5',
  medicalBorder: '#F3D3D5',
  medicalText: '#DA1E28',
  white: '#FFFFFF',
} as const;

export const radii = {
  input: 12,
  button: 14,
  card: 20,
  cardSm: 16,
  pill: 999,
} as const;

export const shadows = {
  card: { shadowColor: '#10315C', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  cta: { shadowColor: colors.navy, shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  modal: { shadowColor: colors.navy, shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
} as const;

export const fonts = {
  oswaldMedium: 'Oswald_500Medium',
  oswaldSemiBold: 'Oswald_600SemiBold',
  oswaldBold: 'Oswald_700Bold',
  barlowRegular: 'Barlow_400Regular',
  barlowMedium: 'Barlow_500Medium',
  barlowSemiBold: 'Barlow_600SemiBold',
  barlowBold: 'Barlow_700Bold',
} as const;

export const spacing = (n: number) => n * 4;

export const groupTone = { AM: colors.red, PM: colors.navy, Ambos: colors.blueAccent } as const;

// Modernist design system: ink on a light ground, one red accent, square corners, 2px rules.
// Token values mirror the Claude Design handoff (_ds/modernist styles.css).

export const C = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201e1d',
  accent: '#ec3013',
  /** #201e1d at 40% */
  divider: 'rgba(32,30,29,0.4)',
  n100: '#f8f4f4',
  n200: '#eae7e7',
  n300: '#d7d3d3',
  n400: '#bab6b6',
  n500: '#9b9797',
  n600: '#7d7979',
  n700: '#605d5d',
  accent100: '#fff2ef',
  accent600: '#dd2b0f',
  accent700: '#ae1800',
  accent800: '#7c1405',
  scrim: 'rgba(45,43,43,0.5)',
};

/** Archivo faces, loaded in App.tsx. Custom fonts pick the face by family, not by fontWeight. */
export const F = {
  body: 'Archivo_400Regular',
  semi: 'Archivo_600SemiBold',
  heavy: 'Archivo_800ExtraBold',
};

export const SHADOW_MD = '0px 3px 10px rgba(45,43,43,0.16)';
export const SHADOW_LG = '0px 12px 32px rgba(45,43,43,0.22)';

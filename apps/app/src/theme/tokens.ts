// Tokens from the approved prototypes: sand and graphite neutrals, one blue accent.

export interface Palette {
  bg: string;
  surface: string;
  sunken: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  good: string;
  warn: string;
  critical: string;
  scrim: string;
}

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    bg: '#F7F6F3',
    surface: '#FFFFFF',
    sunken: '#ECEAE4',
    ink: '#1C1B19',
    muted: '#66635B',
    line: '#E6E3DC',
    accent: '#3D5AC7',
    accentSoft: '#ECEFFB',
    onAccent: '#FFFFFF',
    good: '#2E7D4F',
    warn: '#9A5B06',
    critical: '#B42318',
    scrim: 'rgba(28, 27, 25, 0.45)',
  },
  dark: {
    bg: '#161615',
    surface: '#1F1F1D',
    sunken: '#2A2927',
    ink: '#EDECE8',
    muted: '#A3A097',
    line: '#302F2C',
    accent: '#8EA2F0',
    accentSoft: '#262B40',
    onAccent: '#11131C',
    good: '#6CC08F',
    warn: '#E0B15A',
    critical: '#F07A6E',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;

export const radius = { sm: 8, md: 10, lg: 14, xl: 24, pill: 999 } as const;

export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  serif: 'SourceSerif4_500Medium',
} as const;

export const typeScale = {
  display: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  title: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
} as const;

export type TypeVariant = keyof typeof typeScale;

/** Width from which the app switches to the sidebar layout. */
export const WIDE_BREAKPOINT = 900;

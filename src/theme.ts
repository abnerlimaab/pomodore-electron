import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// ─── MUI Theme augmentation ───────────────────────────────────────────────────

declare module '@mui/material/styles' {
  interface Theme {
    md3: Record<string, string>;
  }
  interface ThemeOptions {
    md3?: Record<string, string>;
  }
}

// ─── Palette token types ──────────────────────────────────────────────────────

interface PaletteTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  outlineVariant: string;
  [key: string]: string;
}

interface PaletteEntry {
  label: string;
  seed: string;
  light: PaletteTokens;
  dark: PaletteTokens;
}

// ─── Material Design 3 palettes ───────────────────────────────────────────────

export const PALETTES: Record<string, PaletteEntry> = {
  violeta: {
    label: 'Violeta',
    seed: '#6750A4',
    light: {
      primary: '#6750A4', onPrimary: '#FFFFFF',
      primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D',
      secondary: '#625B71', onSecondary: '#FFFFFF',
      secondaryContainer: '#E8DEF8', onSecondaryContainer: '#1D192B',
      outlineVariant: '#CAC4D0',
    },
    dark: {
      primary: '#D0BCFF', onPrimary: '#381E72',
      primaryContainer: '#4F378B', onPrimaryContainer: '#EADDFF',
      secondary: '#CCC2DC', onSecondary: '#332D41',
      secondaryContainer: '#4A4458', onSecondaryContainer: '#E8DEF8',
      outlineVariant: '#49454F',
    },
  },
  azul: {
    label: 'Azul',
    seed: '#0061A4',
    light: {
      primary: '#0061A4', onPrimary: '#FFFFFF',
      primaryContainer: '#D1E4FF', onPrimaryContainer: '#001D36',
      secondary: '#535F70', onSecondary: '#FFFFFF',
      secondaryContainer: '#D7E3F7', onSecondaryContainer: '#101C2B',
      outlineVariant: '#C3C7CF',
    },
    dark: {
      primary: '#9ECAFF', onPrimary: '#003258',
      primaryContainer: '#004880', onPrimaryContainer: '#D1E4FF',
      secondary: '#BBC7DB', onSecondary: '#253140',
      secondaryContainer: '#3B4858', onSecondaryContainer: '#D7E3F7',
      outlineVariant: '#43474E',
    },
  },
  verde: {
    label: 'Verde',
    seed: '#386A20',
    light: {
      primary: '#386A20', onPrimary: '#FFFFFF',
      primaryContainer: '#B7F397', onPrimaryContainer: '#042100',
      secondary: '#55624C', onSecondary: '#FFFFFF',
      secondaryContainer: '#D8E7CB', onSecondaryContainer: '#131F0D',
      outlineVariant: '#C3C8BB',
    },
    dark: {
      primary: '#9CD67D', onPrimary: '#0A3900',
      primaryContainer: '#1F5000', onPrimaryContainer: '#B7F397',
      secondary: '#BCCBAF', onSecondary: '#283420',
      secondaryContainer: '#3D4A35', onSecondaryContainer: '#D8E7CB',
      outlineVariant: '#42493D',
    },
  },
  vermelho: {
    label: 'Vermelho',
    seed: '#BA1A1A',
    light: {
      primary: '#BA1A1A', onPrimary: '#FFFFFF',
      primaryContainer: '#FFDAD6', onPrimaryContainer: '#410002',
      secondary: '#775652', onSecondary: '#FFFFFF',
      secondaryContainer: '#FFDAD6', onSecondaryContainer: '#2C1512',
      outlineVariant: '#D8C2BF',
    },
    dark: {
      primary: '#FFB4AB', onPrimary: '#690005',
      primaryContainer: '#93000A', onPrimaryContainer: '#FFDAD6',
      secondary: '#E7BDB8', onSecondary: '#442926',
      secondaryContainer: '#5D3F3B', onSecondaryContainer: '#FFDAD6',
      outlineVariant: '#534341',
    },
  },
  laranja: {
    label: 'Laranja',
    seed: '#8B5000',
    light: {
      primary: '#8B5000', onPrimary: '#FFFFFF',
      primaryContainer: '#FFDDB3', onPrimaryContainer: '#2C1600',
      secondary: '#715B42', onSecondary: '#FFFFFF',
      secondaryContainer: '#FDDCBE', onSecondaryContainer: '#271806',
      outlineVariant: '#D4C4B0',
    },
    dark: {
      primary: '#FFB95C', onPrimary: '#4A2800',
      primaryContainer: '#6B3B00', onPrimaryContainer: '#FFDDB3',
      secondary: '#E0C1A0', onSecondary: '#3F2D17',
      secondaryContainer: '#57432B', onSecondaryContainer: '#FDDCBE',
      outlineVariant: '#52443A',
    },
  },
  rosa: {
    label: 'Rosa',
    seed: '#984061',
    light: {
      primary: '#984061', onPrimary: '#FFFFFF',
      primaryContainer: '#FFD9E3', onPrimaryContainer: '#3E0020',
      secondary: '#74565F', onSecondary: '#FFFFFF',
      secondaryContainer: '#FFD9E3', onSecondaryContainer: '#2B1519',
      outlineVariant: '#D5C0C4',
    },
    dark: {
      primary: '#FFB1C8', onPrimary: '#5E1133',
      primaryContainer: '#7A2949', onPrimaryContainer: '#FFD9E3',
      secondary: '#E5BDC5', onSecondary: '#43282E',
      secondaryContainer: '#5B3F45', onSecondaryContainer: '#FFD9E3',
      outlineVariant: '#534144',
    },
  },
  ciano: {
    label: 'Ciano',
    seed: '#006874',
    light: {
      primary: '#006874', onPrimary: '#FFFFFF',
      primaryContainer: '#97F0FF', onPrimaryContainer: '#001F24',
      secondary: '#4A6267', onSecondary: '#FFFFFF',
      secondaryContainer: '#CCE8ED', onSecondaryContainer: '#051F23',
      outlineVariant: '#BFC8CA',
    },
    dark: {
      primary: '#4FD8EB', onPrimary: '#00363D',
      primaryContainer: '#004F58', onPrimaryContainer: '#97F0FF',
      secondary: '#B1CBD1', onSecondary: '#1B3438',
      secondaryContainer: '#324B4F', onSecondaryContainer: '#CCE8ED',
      outlineVariant: '#3F484A',
    },
  },
};

// ─── Surface tokens ───────────────────────────────────────────────────────────

const lightSurface: Record<string, string> = {
  surface: '#FFFBFE', onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC', onSurfaceVariant: '#49454F',
  background: '#FFFBFE', onBackground: '#1C1B1F',
  outline: '#79747E',
  error: '#B3261E', onError: '#FFFFFF',
  errorContainer: '#F9DEDC', onErrorContainer: '#410E0B',
};

const darkSurface: Record<string, string> = {
  surface: '#1C1B1F', onSurface: '#E6E1E5',
  surfaceVariant: '#49454F', onSurfaceVariant: '#CAC4D0',
  background: '#1C1B1F', onBackground: '#E6E1E5',
  outline: '#938F99',
  error: '#F2B8B5', onError: '#601410',
  errorContainer: '#8C1D18', onErrorContainer: '#F9DEDC',
};

// ─── Theme factory ────────────────────────────────────────────────────────────

export function createAppTheme(mode: 'light' | 'dark' = 'dark', paletteKey = 'violeta'): Theme {
  const palette = PALETTES[paletteKey] ?? PALETTES.violeta;
  const paletteTokens: Record<string, string> = mode === 'dark' ? palette.dark : palette.light;
  const surfaceTokens: Record<string, string> = mode === 'dark' ? darkSurface : lightSurface;
  const tokens: Record<string, string> = { ...surfaceTokens, ...paletteTokens };

  return createTheme({
    palette: {
      mode,
      primary: { main: tokens.primary, contrastText: tokens.onPrimary },
      secondary: { main: tokens.secondary, contrastText: tokens.onSecondary },
      error: { main: tokens.error, contrastText: tokens.onError },
      background: { default: tokens.background, paper: tokens.surface },
      text: { primary: tokens.onSurface, secondary: tokens.onSurfaceVariant },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 400, fontSize: '3.5625rem', lineHeight: 1.123 },
      h2: { fontWeight: 400, fontSize: '2.8125rem', lineHeight: 1.156 },
      h3: { fontWeight: 400, fontSize: '2.25rem', lineHeight: 1.222 },
      h4: { fontWeight: 400, fontSize: '2rem', lineHeight: 1.25 },
      h5: { fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.286 },
      h6: { fontWeight: 500, fontSize: '1.5rem', lineHeight: 1.333 },
      subtitle1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.5, letterSpacing: '0.009em' },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.571, letterSpacing: '0.007em' },
      body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.5, letterSpacing: '0.031em' },
      body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.429, letterSpacing: '0.018em' },
      button: { fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.006em', textTransform: 'none' },
      caption: { fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.333, letterSpacing: '0.033em' },
      overline: { fontWeight: 500, fontSize: '0.75rem', lineHeight: 2.167, letterSpacing: '0.083em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 100, padding: '10px 24px', fontWeight: 500 },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: '0px 1px 2px rgba(0,0,0,0.3)' },
          },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: 'none',
            border: `1px solid ${tokens.outlineVariant}`,
          },
        },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
      MuiTextField: {
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: 4 } },
        },
      },
      MuiListItemButton: { styleOverrides: { root: { borderRadius: 100 } } },
    },
    md3: tokens,
  } as ThemeOptions);
}

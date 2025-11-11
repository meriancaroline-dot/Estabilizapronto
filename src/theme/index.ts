// src/theme/index.ts
// -------------------------------------------------------------
// Exporta o tema completo (light e dark) - VERSÃO PASTEL SUAVE
// -------------------------------------------------------------

import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export const borderRadius = {
  sm: 8, // Aumentado de 4 para 8
  md: 12, // Aumentado de 8 para 12
  lg: 16, // Aumentado de 12 para 16
  xl: 20, // Aumentado de 16 para 20
  xxl: 28, // Aumentado de 24 para 28
  round: 9999, // Adicionado para elementos totalmente arredondados
};

export const shadows = {
  // Sombras mais suaves e delicadas
  level1: {
    shadowColor: '#B4A5D9', // Lavanda suave
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, // Mais suave
    shadowRadius: 3,
    elevation: 1,
  },
  level2: {
    shadowColor: '#B4A5D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Mais suave
    shadowRadius: 6,
    elevation: 2,
  },
  level3: {
    shadowColor: '#B4A5D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, // Mais suave
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    // Nova: sombra extra suave
    shadowColor: '#D4C5E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0.5,
  },
};

export const zIndex = {
  background: 0,
  content: 1,
  modal: 10,
  toast: 20,
  overlay: 30,
};

// Animações suaves
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const lightTheme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animations,
  mode: 'light' as const,
};

export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animations,
  mode: 'dark' as const,
};

export type Theme = typeof lightTheme | typeof darkTheme;
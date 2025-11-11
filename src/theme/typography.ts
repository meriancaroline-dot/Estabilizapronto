// src/theme/typography.ts
// -------------------------------------------------------------
// Tipografia base usada no app - VERSÃO DELICADA
// Fontes mais leves e espaçamento generoso
// -------------------------------------------------------------

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34, // Adicionado para títulos grandes
  },
  fontWeight: {
    light: '300' as const, // Adicionado peso leve
    regular: '400' as const,
    medium: '500' as const, // Reduzido de 600 para mais delicado
    semibold: '600' as const, // Adicionado
    bold: '700' as const,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    xxxl: 48, // Adicionado
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};
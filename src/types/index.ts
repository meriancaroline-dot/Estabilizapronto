// src/types/index.ts
// -------------------------------------------------------------
// Interfaces globais do Estabiliza
// -------------------------------------------------------------

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  neutral: Record<number, string>;
}

export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>;
  fontWeight: Record<'regular' | 'medium' | 'bold', string>;
  lineHeight: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
}

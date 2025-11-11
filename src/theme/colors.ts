// src/theme/colors.ts
// -------------------------------------------------------------
// Paleta de cores do Estabiliza - PASTEL EQUILIBRADO
// Suave, mas com contraste visível e leitura clara.
// -------------------------------------------------------------

export const lightColors = {
  // ====== Cores principais - Pastel vívido ======
  primary: "#A996D8", // Lavanda com mais corpo
  secondary: "#CBA7E2", // Lilás suave porém mais saturado
  success: "#96D4AC", // Verde menta mais vibrante
  warning: "#F5BE58", // Dourado pastel visível
  danger: "#F29BB2", // Rosa mais vivo, ainda suave

  // ====== Fundo e superfície - Tons claros aconchegantes ======
  background: "#FBF8F2", // Off-white quente
  surface: "#F5EFE8", // Bege claro com contraste sutil

  // ====== Texto - reforçado pra leitura ======
  text: "#403A4E", // Roxo acinzentado forte
  textSecondary: "#867B91", // Lavanda acinzentado visível

  // ====== Bordas e neutros ======
  border: "#E3DAD2",
  neutral: {
    100: "#FBF8F2",
    200: "#F5EFE8",
    300: "#EDE5DC",
    400: "#E3DAD2",
    500: "#C5BBB2",
    600: "#9D8EA6",
    700: "#7D6D91",
    800: "#5E5173",
    900: "#403A4E",
  },

  // ====== Extras ======
  muted: "#B0A4BD",
  glass: "rgba(251, 248, 242, 0.7)",
  overlay: "rgba(180, 165, 217, 0.1)",

  // ====== Acentos ======
  accent: {
    lavender: "#C9B6E2",
    mint: "#B5E1C1",
    peach: "#F9CDA7",
    rose: "#F5B6C8",
    sky: "#BBD5EE",
  },
};

export const darkColors = {
  // ====== Cores principais - Pastel equilibrado para fundo escuro ======
  primary: "#9C88CA",
  secondary: "#B592D4",
  success: "#7FBE96",
  warning: "#E3B55C",
  danger: "#E48DA3",

  // ====== Fundo e superfície ======
  background: "#1D1823",
  surface: "#282232",

  // ====== Texto ======
  text: "#ECE6F1",
  textSecondary: "#C2B5CF",

  // ====== Bordas e neutros ======
  border: "#3A3144",
  neutral: {
    100: "#1D1823",
    200: "#282232",
    300: "#3A3144",
    400: "#4C4356",
    500: "#6A5E73",
    600: "#8A7E96",
    700: "#A99DB6",
    800: "#C9BED3",
    900: "#ECE6F1",
  },

  // ====== Extras ======
  muted: "#7C6F88",
  glass: "rgba(156, 136, 202, 0.18)",
  overlay: "rgba(180, 165, 217, 0.12)",

  // ====== Acentos ======
  accent: {
    lavender: "#A78CC8",
    mint: "#74B38E",
    peach: "#D1A873",
    rose: "#D78CA1",
    sky: "#8BAFC9",
  },
};

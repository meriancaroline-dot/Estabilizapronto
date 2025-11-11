// -------------------------------------------------------------
// src/hooks/useTheme.tsx
// -------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { lightColors, darkColors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { borderRadius } from "../theme";

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export type ThemeMode = "light" | "dark" | "system";

type Palette = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
  muted?: string;
  glass?: string;
  overlay?: string;
  neutral: Record<number, string>;
  accent?: {
    lavender: string;
    mint: string;
    peach: string;
    rose: string;
    sky: string;
  };
};

export type Theme = {
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  spacing: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    huge: number;
    massive: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    round: number;
  };
};

// -------------------------------------------------------------
// Contexto
// -------------------------------------------------------------
type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setThemeMode: (m: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const sys = useColorScheme() || "light";
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("app_theme_mode");
        if (saved === "light" || saved === "dark" || saved === "system") {
          setMode(saved);
        }
      } catch (err) {
        console.error("Erro ao carregar tema salvo:", err);
      }
    })();
  }, []);

  const isDark = useMemo(() => {
    if (mode === "system") return sys === "dark";
    return mode === "dark";
  }, [mode, sys]);

  const theme: Theme = useMemo(
    () => ({
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      borderRadius,
    }),
    [isDark, mode]
  );

  const setThemeMode = async (m: ThemeMode) => {
    try {
      setMode(m);
      await AsyncStorage.setItem("app_theme_mode", m);
    } catch (err) {
      console.error("Erro ao salvar tema:", err);
    }
  };

  const toggleTheme = async () => {
    const next =
      mode === "light"
        ? "dark"
        : mode === "dark"
        ? "light"
        : sys === "dark"
        ? "light"
        : "dark";

    await setThemeMode(next);
  };

  const value = useMemo(
    () => ({
      theme,
      isDark,
      mode,
      setThemeMode,
      toggleTheme,
    }),
    [theme, isDark, mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}

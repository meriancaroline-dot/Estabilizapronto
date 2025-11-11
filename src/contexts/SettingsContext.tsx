// -------------------------------------------------------------
// src/contexts/SettingsContext.tsx
// -------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import { AppSettings, ThemeMode } from "@/types/models";

import app from "@/services/firebaseConfig";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const STORAGE_KEY = "@estabiliza:settings";
const db = getFirestore(app);

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
interface SettingsContextData {
  settings: AppSettings;
  updateSettings: (data: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  loading: boolean;
}

// -------------------------------------------------------------
// Contexto
// -------------------------------------------------------------
const SettingsContext = createContext<SettingsContextData | undefined>(
  undefined
);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const SettingsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { theme, setThemeMode: applyThemeMode } = useTheme();
  const { user, patchUser } = useUser();

 const [settings, setSettings] = useState<AppSettings>({
  theme: theme.mode,
  notificationsEnabled: true,
  dailyReminderTime: "08:00",
  backupEnabled: true,
  syncEnabled: true,
  language: "pt", // ✅ idioma padrão
  updatedAt: new Date().toISOString(), // ✅ data padrão
});


  const [loading, setLoading] = useState(true);
  const remoteLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.warn("⚠️ Falha ao carregar configurações locais:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistSettings = useCallback(async (data: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar configurações localmente:", e);
    }
  }, []);

  useEffect(() => {
    if (!user || loading || !settings.syncEnabled || remoteLoadedRef.current)
      return;

    remoteLoadedRef.current = true;

    (async () => {
      try {
        const ref = doc(db, "users", user.id, "config", "settings");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const remote = snap.data() as Partial<AppSettings>;
          const merged: AppSettings = { ...settings, ...remote };
          setSettings(merged);
          await persistSettings(merged);
          if (merged.theme) {
            await applyThemeMode(merged.theme);
          }
        } else {
          await setDoc(ref, settings);
        }
      } catch (e) {
        console.warn("⚠️ Falha ao sincronizar configurações com a nuvem:", e);
      }
    })();
  }, [user, loading, settings.syncEnabled, persistSettings, applyThemeMode, settings]);

  const syncToCloud = useCallback(
    async (data: AppSettings) => {
      if (!user || !data.syncEnabled) return;
      try {
        const ref = doc(db, "users", user.id, "config", "settings");
        await setDoc(ref, data, { merge: true });
      } catch (e) {
        console.warn("⚠️ Erro ao salvar configurações na nuvem:", e);
      }
    },
    [user]
  );

  const updateSettings = useCallback(
    async (data: Partial<AppSettings>) => {
      const updated: AppSettings = { ...settings, ...data };

      setSettings(updated);
      await persistSettings(updated);

      if (user) {
        await patchUser({
          preferences: {
            ...user.preferences,
            themeMode: updated.theme ?? user.preferences.themeMode,
            notificationsEnabled:
              updated.notificationsEnabled ??
              user.preferences.notificationsEnabled,
            dailyReminderTime:
              updated.dailyReminderTime ?? user.preferences.dailyReminderTime,
          },
        });
      }

      if (data.theme) {
        await applyThemeMode(data.theme);
      }

      await syncToCloud(updated);
    },
    [settings, persistSettings, user, patchUser, applyThemeMode, syncToCloud]
  );

  const resetSettings = useCallback(async () => {
  const defaults: AppSettings = {
  theme: "system",
  notificationsEnabled: true,
  dailyReminderTime: "08:00",
  backupEnabled: false,
  syncEnabled: true,
  language: "pt",
  updatedAt: new Date().toISOString(),
};

    setSettings(defaults);
    await persistSettings(defaults);
    await applyThemeMode(defaults.theme);
    await syncToCloud(defaults);
  }, [persistSettings, applyThemeMode, syncToCloud]);

  const toggleThemeMode = useCallback(async () => {
    const next: ThemeMode = settings.theme === "dark" ? "light" : "dark";
    await updateSettings({ theme: next });
  }, [settings.theme, updateSettings]);

  const handleSetTheme = useCallback(
    async (mode: ThemeMode) => {
      await updateSettings({ theme: mode });
    },
    [updateSettings]
  );

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      toggleThemeMode,
      setThemeMode: handleSetTheme,
      loading,
    }),
    [settings, updateSettings, resetSettings, toggleThemeMode, handleSetTheme, loading]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useSettings(): SettingsContextData {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  }
  return ctx;
}

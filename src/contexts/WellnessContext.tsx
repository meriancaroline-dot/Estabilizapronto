// src/contexts/WellnessContext.tsx
// Contexto novo para lembretes de bem-estar (água + alongamento)
// NÃO mexe em nada do que já existe
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

type TimeConfig = {
  start: string; // "08:00"
  end: string;   // "22:00"
  intervalMinutes: number;
};

type WellnessState = {
  waterEnabled: boolean;
  waterConfig: TimeConfig;
  waterTodayCount: number;
  stretchEnabled: boolean;
  stretchConfig: TimeConfig;
  stretchTodayCount: number;
};

type WellnessContextType = {
  state: WellnessState;
  toggleWater: (on: boolean) => Promise<void>;
  toggleStretch: (on: boolean) => Promise<void>;
  updateWaterConfig: (cfg: TimeConfig) => Promise<void>;
  updateStretchConfig: (cfg: TimeConfig) => Promise<void>;
  registerWater: () => Promise<void>;
  registerStretch: () => Promise<void>;
};

const DEFAULT_STATE: WellnessState = {
  waterEnabled: false,
  waterConfig: {
    start: "08:00",
    end: "22:00",
    intervalMinutes: 90, // 1h30
  },
  waterTodayCount: 0,
  stretchEnabled: false,
  stretchConfig: {
    start: "09:00",
    end: "19:00",
    intervalMinutes: 120, // 2h
  },
  stretchTodayCount: 0,
};

const STORAGE_KEY = "wellness_state_v1";

const WellnessContext = createContext<WellnessContextType | undefined>(
  undefined
);

// helper pra converter "08:00" -> Date de hoje
function buildDateToday(time: string): Date {
  const [h, m] = time.split(":").map((n) => Number(n));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// agenda repetição dentro do intervalo
async function scheduleWellnessNotification(
  id: string,
  title: string,
  body: string,
  intervalMinutes: number
): Promise<void> {
  // SDK 54 -> precisa do type
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: intervalMinutes * 60,
      repeats: true,
    },
  });
  // OBS: aqui a gente não está usando o "id" do parâmetro
  // porque expo dá o id de volta – se precisar armazenar, pode adaptar
}

export const WellnessProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<WellnessState>(DEFAULT_STATE);

  // carregar
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const parsed = JSON.parse(json) as WellnessState;
          setState(parsed);
        }
      } catch (e) {
        console.error("Erro ao carregar wellness:", e);
      }
    })();
  }, []);

  const persist = useCallback(async (next: WellnessState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleWater = useCallback(
    async (on: boolean) => {
      const next: WellnessState = {
        ...state,
        waterEnabled: on,
      };
      await persist(next);
      if (on) {
        await Notifications.requestPermissionsAsync();
        await scheduleWellnessNotification(
          "water",
          "💧 Beber água",
          "Hora de beber água! Hidrate-se 💙",
          state.waterConfig.intervalMinutes
        );
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync(); // simplão
      }
    },
    [state, persist]
  );

  const toggleStretch = useCallback(
    async (on: boolean) => {
      const next: WellnessState = {
        ...state,
        stretchEnabled: on,
      };
      await persist(next);
      if (on) {
        await Notifications.requestPermissionsAsync();
        await scheduleWellnessNotification(
          "stretch",
          "🧘 Alongar e movimentar",
          "Pausa curta: se alonga rapidinho 🙆",
          state.stretchConfig.intervalMinutes
        );
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    },
    [state, persist]
  );

  const updateWaterConfig = useCallback(
    async (cfg: TimeConfig) => {
      const next: WellnessState = {
        ...state,
        waterConfig: cfg,
      };
      await persist(next);
      if (state.waterEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await scheduleWellnessNotification(
          "water",
          "💧 Beber água",
          "Hora de beber água! Hidrate-se 💙",
          cfg.intervalMinutes
        );
      }
    },
    [state, persist]
  );

  const updateStretchConfig = useCallback(
    async (cfg: TimeConfig) => {
      const next: WellnessState = {
        ...state,
        stretchConfig: cfg,
      };
      await persist(next);
      if (state.stretchEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await scheduleWellnessNotification(
          "stretch",
          "🧘 Alongar e movimentar",
          "Pausa curta: se alonga rapidinho 🙆",
          cfg.intervalMinutes
        );
      }
    },
    [state, persist]
  );

  const registerWater = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    // aqui poderíamos separar por dia, mas vou manter simples:
    const next: WellnessState = {
      ...state,
      waterTodayCount: state.waterTodayCount + 1,
    };
    await persist(next);
  }, [state, persist]);

  const registerStretch = useCallback(async () => {
    const next: WellnessState = {
      ...state,
      stretchTodayCount: state.stretchTodayCount + 1,
    };
    await persist(next);
  }, [state, persist]);

  const value = useMemo<WellnessContextType>(
    () => ({
      state,
      toggleWater,
      toggleStretch,
      updateWaterConfig,
      updateStretchConfig,
      registerWater,
      registerStretch,
    }),
    [
      state,
      toggleWater,
      toggleStretch,
      updateWaterConfig,
      updateStretchConfig,
      registerWater,
      registerStretch,
    ]
  );

  return (
    <WellnessContext.Provider value={value}>
      {children}
    </WellnessContext.Provider>
  );
};

export function useWellness(): WellnessContextType {
  const ctx = useContext(WellnessContext);
  if (!ctx) {
    throw new Error("useWellness deve ser usado dentro de WellnessProvider");
  }
  return ctx;
}

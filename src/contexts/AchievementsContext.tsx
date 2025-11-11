// -------------------------------------------------------------
// src/contexts/AchievementsContext.tsx
// -------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

// -----------------------------
// Tipos
// -----------------------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number; // 0 a 100
  unlockedAt?: string;
  userId: string;
}

interface AchievementsContextData {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  addAchievement: (data: Omit<Achievement, "id" | "unlockedAt">) => Promise<Achievement>;
  updateAchievement: (id: string, data: Partial<Omit<Achievement, "id">>) => Promise<Achievement>;
  deleteAchievement: (id: string) => Promise<void>;

  setProgress: (id: string, progress: number) => Promise<Achievement>;
  incrementProgress: (id: string, delta: number) => Promise<Achievement>;
  getProgressFor: (id: string) => number;

  unlockAchievement: (id: string, dateISO?: string) => Promise<Achievement>;
  lockAchievement: (id: string) => Promise<Achievement>;

  getUnlocked: () => Achievement[];
  getLocked: () => Achievement[];
  getRecentlyUnlocked: (days: number) => Achievement[];

  refreshFromStorage: () => Promise<void>;
}

const STORAGE_KEY = "@estabiliza:achievements";
const AchievementsContext = createContext<AchievementsContextData | undefined>(undefined);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const AchievementsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const persist = useCallback(async (list: Achievement[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Erro ao salvar conquistas:", e);
      setError("Falha ao salvar conquistas.");
    }
  }, []);

  const sortList = useCallback((list: Achievement[]) => {
    const unlocked = list
      .filter((a) => a.unlockedAt)
      .sort((a, b) => dayjs(b.unlockedAt!).valueOf() - dayjs(a.unlockedAt!).valueOf());
    const locked = list.filter((a) => !a.unlockedAt).sort((a, b) => a.title.localeCompare(b.title));
    return [...unlocked, ...locked];
  }, []);

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Achievement[] = raw ? JSON.parse(raw) : [];
      setAchievements(sortList(parsed));
    } catch (e) {
      console.error("Erro ao carregar conquistas:", e);
      setError("Falha ao carregar conquistas.");
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [sortList]);

  useEffect(() => {
    dayjs.locale("pt-br");
    loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------------------------------------
  // CRUD
  // -----------------------------------------------------------
  const addAchievement = useCallback(
    async (data: Omit<Achievement, "id" | "unlockedAt">) => {
      if (!data.title?.trim()) throw new Error("Título é obrigatório.");
      if (!data.description?.trim()) throw new Error("Descrição é obrigatória.");
      if (!data.icon?.trim()) throw new Error("Ícone é obrigatório.");

      const newItem: Achievement = {
        ...data,
        id: `ach_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
        progress: clamp(data.progress, 0, 100),
        unlockedAt: data.progress >= 100 ? new Date().toISOString() : undefined,
      };

      const next = sortList([...achievements, newItem]);
      setAchievements(next);
      await persist(next);
      return newItem;
    },
    [achievements, persist, sortList]
  );

  const updateAchievement = useCallback(
    async (id: string, data: Partial<Omit<Achievement, "id">>) => {
      const idx = achievements.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Conquista não encontrada.");

      const original = achievements[idx];
      const nextProgress =
        data.progress !== undefined ? clamp(data.progress, 0, 100) : original.progress;

      const updated: Achievement = {
        ...original,
        ...data,
        progress: nextProgress,
        unlockedAt:
          data.unlockedAt !== undefined
            ? data.unlockedAt
            : nextProgress >= 100
            ? original.unlockedAt ?? new Date().toISOString()
            : original.unlockedAt,
      };

      const list = achievements.map((a) => (a.id === id ? updated : a));
      const sorted = sortList(list);
      setAchievements(sorted);
      await persist(sorted);
      return updated;
    },
    [achievements, persist, sortList]
  );

  const deleteAchievement = useCallback(
    async (id: string) => {
      const filtered = achievements.filter((a) => a.id !== id);
      setAchievements(filtered);
      await persist(filtered);
    },
    [achievements, persist]
  );

  // -----------------------------------------------------------
  // Progresso
  // -----------------------------------------------------------
  const setProgress = useCallback(
    async (id: string, progress: number) => updateAchievement(id, { progress: clamp(progress, 0, 100) }),
    [updateAchievement]
  );

  const incrementProgress = useCallback(
    async (id: string, delta: number) => {
      const item = achievements.find((a) => a.id === id);
      if (!item) throw new Error("Conquista não encontrada.");
      const next = clamp(item.progress + delta, 0, 100);
      return updateAchievement(id, { progress: next });
    },
    [achievements, updateAchievement]
  );

  const getProgressFor = useCallback(
    (id: string) => achievements.find((a) => a.id === id)?.progress ?? 0,
    [achievements]
  );

  // -----------------------------------------------------------
  // Desbloqueio
  // -----------------------------------------------------------
  const unlockAchievement = useCallback(
    async (id: string, dateISO?: string) =>
      updateAchievement(id, { unlockedAt: dateISO ?? new Date().toISOString(), progress: 100 }),
    [updateAchievement]
  );

  const lockAchievement = useCallback(
    async (id: string) => updateAchievement(id, { unlockedAt: undefined }),
    [updateAchievement]
  );

  // -----------------------------------------------------------
  // Consultas
  // -----------------------------------------------------------
  const getUnlocked = useCallback(
    () => achievements.filter((a) => a.unlockedAt),
    [achievements]
  );

  const getLocked = useCallback(
    () => achievements.filter((a) => !a.unlockedAt),
    [achievements]
  );

  const getRecentlyUnlocked = useCallback(
    (days: number) => {
      const since = dayjs().subtract(days, "day");
      return achievements.filter((a) => a.unlockedAt && dayjs(a.unlockedAt).isAfter(since));
    },
    [achievements]
  );

  const refreshFromStorage = useCallback(loadFromStorage, [loadFromStorage]);

  const value = useMemo(
    () => ({
      achievements,
      loading,
      error,
      isInitialized,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      setProgress,
      incrementProgress,
      getProgressFor,
      unlockAchievement,
      lockAchievement,
      getUnlocked,
      getLocked,
      getRecentlyUnlocked,
      refreshFromStorage,
    }),
    [
      achievements,
      loading,
      error,
      isInitialized,
      addAchievement,
      updateAchievement,
      deleteAchievement,
      setProgress,
      incrementProgress,
      getProgressFor,
      unlockAchievement,
      lockAchievement,
      getUnlocked,
      getLocked,
      getRecentlyUnlocked,
      refreshFromStorage,
    ]
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

// -------------------------------------------------------------
// Hook de acesso
// -------------------------------------------------------------
export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements deve ser usado dentro de AchievementsProvider");
  return ctx;
}

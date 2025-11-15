// -------------------------------------------------------------
// src/contexts/MissionsContext.tsx
// -------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { missions, Mission } from "@/gamification/MissionsEngine";

interface MissionsContextData {
  missions: Mission[];
  activeMissions: Mission[];
  completedMissions: Mission[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MissionsContext = createContext<MissionsContextData | undefined>(
  undefined
);

export const MissionsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [missionsList, setMissionsList] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromEngine = useCallback(async () => {
    setLoading(true);
    try {
      await missions.init();
      setMissionsList([...missions.missions]);
      setError(null);
    } catch (e) {
      console.error("Erro ao carregar missões:", e);
      setError("Falha ao carregar missões.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromEngine();
  }, [loadFromEngine]);

  // polling leve só pra refletir mudanças
  useEffect(() => {
    let isMounted = true;

    const interval = setInterval(() => {
      if (!isMounted) return;

      setMissionsList((prev) => {
        const current = missions.missions;
        const prevStr = JSON.stringify(prev);
        const currStr = JSON.stringify(current);

        if (prevStr !== currStr) {
          return [...current];
        }
        return prev;
      });
    }, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeMissions = useMemo(() => {
    const actives = missionsList.filter((m) => !m.completedAt);
    actives.sort((a, b) => a.target - b.target);
    return actives.slice(0, 10);
  }, [missionsList]);

  const completedMissions = useMemo(
    () =>
      missionsList
        .filter((m) => !!m.completedAt)
        .sort((a, b) => {
          if (!a.completedAt || !b.completedAt) return 0;
          return (
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
          );
        }),
    [missionsList]
  );

  const refresh = useCallback(async () => {
    await loadFromEngine();
  }, [loadFromEngine]);

  const value: MissionsContextData = {
    missions: missionsList,
    activeMissions,
    completedMissions,
    loading,
    error,
    refresh,
  };

  return (
    <MissionsContext.Provider value={value}>
      {children}
    </MissionsContext.Provider>
  );
};

export function useMissions() {
  const ctx = useContext(MissionsContext);
  if (!ctx) {
    throw new Error("useMissions deve ser usado dentro de MissionsProvider");
  }
  return ctx;
}

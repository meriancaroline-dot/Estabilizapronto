// -------------------------------------------------------------
// src/contexts/MissionEventsContext.tsx
// -------------------------------------------------------------
import React, { createContext, useContext, useEffect, useState } from "react";
import { missions, Mission } from "@/gamification/MissionsEngine";
import { gamification } from "@/gamification/GamificationEngine";
import { Alert, Vibration } from "react-native";

interface MissionEventsContextData {
  lastCompleted?: Mission;
  lastProgressed?: Mission;
  clearEvents: () => void;
}

const MissionEventsContext =
  createContext<MissionEventsContextData | undefined>(undefined);

export function MissionEventsProvider({ children }: React.PropsWithChildren) {
  const [lastCompleted, setLastCompleted] = useState<Mission | undefined>();
  const [lastProgressed, setLastProgressed] = useState<Mission | undefined>();

  useEffect(() => {
    let prevJSON = JSON.stringify(missions.missions);

    const interval = setInterval(() => {
      const currJSON = JSON.stringify(missions.missions);

      if (currJSON === prevJSON) return;

      const previous = JSON.parse(prevJSON) as Mission[];
      const current = missions.missions;

      for (let i = 0; i < current.length; i++) {
        const before = previous[i];
        const after = current[i];

        if (!before || !after) continue;

        // progresso aumentou mas ainda não finalizou
        if (after.progress > before.progress && after.progress < 100) {
          setLastProgressed(after);
        }

        // missão acabou de ser concluída
        if (!before.completedAt && after.completedAt) {
          setLastCompleted(after);

          const reward = after.rewardXP ?? 0;
          if (reward > 0) {
            void gamification.addXP(reward);
          }

          Vibration.vibrate(50);
          Alert.alert(
            "Missão concluída!",
            `"${after.title}" foi completada ⭐\n\n+${
              reward || 0
            } XP de recompensa`
          );
        }
      }

      prevJSON = currJSON;
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearEvents = () => {
    setLastCompleted(undefined);
    setLastProgressed(undefined);
  };

  return (
    <MissionEventsContext.Provider
      value={{
        lastCompleted,
        lastProgressed,
        clearEvents,
      }}
    >
      {children}
    </MissionEventsContext.Provider>
  );
}

export function useMissionEvents() {
  const ctx = useContext(MissionEventsContext);
  if (!ctx)
    throw new Error(
      "useMissionEvents deve ser usado dentro de MissionEventsProvider"
    );
  return ctx;
}

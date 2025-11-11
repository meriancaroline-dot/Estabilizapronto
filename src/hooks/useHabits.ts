// -------------------------------------------------------------
// Hook de hábitos com seed inicial + streak diário confiável
// -------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import { useStorage } from "./useStorage";
import { Habit } from "@/types/models";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/contexts/UserContext";
import { logEvent } from "@/services/AnalyticsService"; // ✅ adicionado

// -------------------------------------------------------------
// Hábitos padrão (seed) — carregados se não houver nada salvo
// -------------------------------------------------------------
const SEED_HABITS: Array<Omit<Habit, "id" | "streak" | "lastCompleted">> = [
  {
    title: "Dormir 6h ou mais por dia",
    description: "Sono restaurador para estabilidade emocional.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Exposição de 30 minutos ao sol",
    description: "Luz natural regula o ciclo circadiano e melhora o humor.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Tomar medicação",
    description: "Seguir o tratamento conforme orientação profissional.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Beber ao menos 2L de água",
    description: "Hidratação adequada melhora concentração e energia.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Fazer 3 refeições",
    description: "Alimentação regular mantém equilíbrio de energia e humor.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Reduzir o tempo de tela",
    description: "Evitar estímulos excessivos e melhorar a qualidade do sono.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
  {
    title: "Atividade física",
    description: "Mover o corpo regularmente ajuda o humor.",
    frequency: "daily",
    createdAt: new Date().toISOString(),
  },
];

// Util para “zerar” hora e comparar dias
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
const MS_DAY = 1000 * 60 * 60 * 24;

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useHabits() {
  const { user } = useUser(); // ✅ usado pra enviar ID no analytics

  const {
    value: habits,
    setValue: setHabits,
    save: saveHabits,
    load: loadHabits,
  } = useStorage<Habit[]>({
    key: "habits",
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // Carregar hábitos + seed inicial
  useEffect(() => {
    (async () => {
      await loadHabits();
      setLoading(false);
    })();
  }, [loadHabits]);

  // Se não houver hábitos salvos, semeia os padrões
  useEffect(() => {
    (async () => {
      if (!loading && habits.length === 0) {
        const seeded: Habit[] = SEED_HABITS.map((h) => ({
          ...h,
          id: uuidv4(),
          streak: 0,
          lastCompleted: undefined,
        }));
        setHabits(seeded);
        await saveHabits(seeded);

        // ✅ Log inicial
        await logEvent({
          type: "habits_seeded",
          userId: user?.id,
          metadata: { count: seeded.length },
        });
      }
    })();
  }, [loading, habits.length, setHabits, saveHabits, user]);

  // Criar hábito
  const addHabit = useCallback(
    async (data: Omit<Habit, "id" | "streak" | "lastCompleted">) => {
      try {
        const newHabit: Habit = {
          ...data,
          id: uuidv4(),
          streak: 0,
          lastCompleted: undefined,
          createdAt: new Date().toISOString(),
        };

        const updated = [...habits, newHabit];
        setHabits(updated);
        await saveHabits(updated);

        // ✅ Log no Firestore
        await logEvent({
          type: "habit_added",
          userId: user?.id,
          metadata: { title: data.title },
        });
      } catch (e) {
        console.error("Erro ao adicionar hábito:", e);
        Alert.alert("Erro", "Não foi possível criar o hábito.");
      }
    },
    [habits, setHabits, saveHabits, user]
  );

  // Atualizar hábito
  const updateHabit = useCallback(
    async (id: string, updates: Partial<Habit>) => {
      try {
        const updatedList = habits.map((h) =>
          h.id === id ? { ...h, ...updates } : h
        );
        setHabits(updatedList);
        await saveHabits(updatedList);

        // ✅ Log
        await logEvent({
          type: "habit_updated",
          userId: user?.id,
          metadata: { habitId: id, updates },
        });
      } catch (e) {
        console.error("Erro ao atualizar hábito:", e);
        Alert.alert("Erro", "Não foi possível atualizar o hábito.");
      }
    },
    [habits, setHabits, saveHabits, user]
  );

  // Excluir hábito
  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const filtered = habits.filter((h) => h.id !== id);
        setHabits(filtered);
        await saveHabits(filtered);

        // ✅ Log
        await logEvent({
          type: "habit_deleted",
          userId: user?.id,
          metadata: { habitId: id },
        });
      } catch (e) {
        console.error("Erro ao remover hábito:", e);
        Alert.alert("Erro", "Não foi possível remover o hábito.");
      }
    },
    [habits, setHabits, saveHabits, user]
  );

  // Concluir hábito — cálculo de streak à prova de fuso/horário
  const completeHabit = useCallback(
    async (id: string) => {
      try {
        const today = startOfDay(new Date());

        const updatedList = habits.map((h) => {
          if (h.id !== id) return h;

          const prevStreak = h.streak ?? 0;
          let nextStreak = prevStreak;

          if (h.lastCompleted) {
            const last = startOfDay(new Date(h.lastCompleted));
            const diffDays = Math.floor(
              (today.getTime() - last.getTime()) / MS_DAY
            );

            if (diffDays === 0) {
              nextStreak = prevStreak > 0 ? prevStreak : 1;
            } else if (diffDays === 1) {
              nextStreak = prevStreak + 1;
            } else {
              nextStreak = 1;
            }
          } else {
            nextStreak = 1;
          }

          // ✅ Log do hábito concluído
          logEvent({
            type: "habit_completed",
            userId: user?.id,
            metadata: { habitId: h.id, title: h.title, streak: nextStreak },
          });

          return {
            ...h,
            lastCompleted: today.toISOString(),
            streak: nextStreak,
          };
        });

        setHabits(updatedList);
        await saveHabits(updatedList);
      } catch (e) {
        console.error("Erro ao completar hábito:", e);
        Alert.alert("Erro", "Não foi possível completar o hábito.");
      }
    },
    [habits, setHabits, saveHabits, user]
  );

  // Resetar streak
  const resetStreak = useCallback(
    async (id: string) => {
      const updated = habits.map((h) =>
        h.id === id ? { ...h, streak: 0, lastCompleted: undefined } : h
      );
      setHabits(updated);
      await saveHabits(updated);

      // ✅ Log
      await logEvent({
        type: "habit_streak_reset",
        userId: user?.id,
        metadata: { habitId: id },
      });
    },
    [habits, setHabits, saveHabits, user]
  );

  // Limpar tudo
  const clearHabits = useCallback(async () => {
    setHabits([]);
    await saveHabits([]);

    // ✅ Log
    await logEvent({
      type: "habits_cleared",
      userId: user?.id,
    });
  }, [setHabits, saveHabits, user]);

  return {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    resetStreak,
    clearHabits,
  };
}

// -------------------------------------------------------------
// src/hooks/useMood.ts
// -------------------------------------------------------------

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useStorage } from "./useStorage";
import * as Notifications from "expo-notifications";

// -------------------------------------------------------------
// Tipo do humor + clima + estação + ciclo
// -------------------------------------------------------------
export type MoodEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  period: "morning" | "afternoon" | "night";
  mood: string;
  emoji: string;
  rating: number; // 1–5
  climate?: "quente" | "frio" | "chuvoso" | "nublado" | "ensolarado";
  season?: "verão" | "outono" | "inverno" | "primavera";
  isMenstrual?: boolean; // ⭐ NOVO
};

// -------------------------------------------------------------
// Estação do ano (BR)
// -------------------------------------------------------------
function getSeason(date: Date): MoodEntry["season"] {
  const month = date.getMonth() + 1;

  if (month === 12 || month === 1 || month === 2) return "verão";
  if (month === 3 || month === 4 || month === 5) return "outono";
  if (month === 6 || month === 7 || month === 8) return "inverno";
  return "primavera";
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useMood() {
  // moods salvos
  const {
    value: moods,
    setValue: setMoods,
    save: saveMoods,
    load: loadMoods,
  } = useStorage<MoodEntry[]>({
    key: "moods",
    initialValue: [],
  });

  // XP e streak salvos
  const {
    value: moodStats,
    setValue: setMoodStats,
    save: saveMoodStats,
    load: loadMoodStats,
  } = useStorage<{ xp: number; streak: number; lastDate: string | null }>({
    key: "mood_stats",
    initialValue: { xp: 0, streak: 0, lastDate: null },
  });

  const [loading, setLoading] = useState(true);

  // carregar moods
  useEffect(() => {
    (async () => {
      try {
        await loadMoods();
        await loadMoodStats();
      } catch (e) {
        console.error("Erro ao carregar moods:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMoods, loadMoodStats]);

  // -----------------------------------------------------------
  // XP + STREAK
  // -----------------------------------------------------------
  const registerXPandStreak = useCallback(
    async (today: string) => {
      const stats = moodStats ?? { xp: 0, streak: 0, lastDate: null };

      const newXP = (stats.xp ?? 0) + 10; // +10 XP por registro

      let newStreak = stats.streak ?? 0;

      if (!stats.lastDate) {
        newStreak = 1;
      } else {
        const last = new Date(stats.lastDate);
        const current = new Date(today);

        const diff =
          (current.getTime() - last.getTime()) /
          (1000 * 60 * 60 * 24);

        if (diff === 1) {
          newStreak += 1;
        } else if (diff > 1) {
          newStreak = 1;
        }
      }

      const updated = {
        xp: newXP,
        streak: newStreak,
        lastDate: today,
      };

      setMoodStats(updated);
      await saveMoodStats(updated);

      console.log(`✨ +10 XP | 🔥 streak: ${newStreak}`);
    },
    [moodStats, setMoodStats, saveMoodStats]
  );

  // -----------------------------------------------------------
  // Adiciona ou atualiza humor
  // -----------------------------------------------------------
  const addMood = useCallback(
    async (
      period: MoodEntry["period"],
      mood: string,
      emoji: string,
      rating: number,
      climate?: MoodEntry["climate"],
      isMenstrual?: boolean
    ) => {
      try {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const season = getSeason(now);

        const existing = moods.find(
          (m) => m.date === today && m.period === period
        );

        const newEntry: MoodEntry = {
          id: existing ? existing.id : uuidv4(),
          date: today,
          period,
          mood,
          emoji,
          rating,
          climate,
          season,
          isMenstrual,
        };

        const updated = existing
          ? moods.map((m) => (m.id === existing.id ? newEntry : m))
          : [...moods, newEntry];

        if (JSON.stringify(moods) !== JSON.stringify(updated)) {
          setMoods(updated);
          await saveMoods(updated);
          await registerXPandStreak(today);

          console.log(
            `🧠 Humor salvo (${period}) — ${mood}${
              climate ? ` | clima: ${climate}` : ""
            } | estação: ${season}${isMenstrual ? " | período menstrual" : ""}`
          );
        }
      } catch (e) {
        console.error("Erro ao adicionar humor:", e);
        Alert.alert("Erro", "Não foi possível registrar o humor.");
      }
    },
    [moods, setMoods, saveMoods, registerXPandStreak]
  );

  // -----------------------------------------------------------
  // Excluir humor
  // -----------------------------------------------------------
  const deleteMood = useCallback(
    async (id: string) => {
      try {
        const filtered = moods.filter((m) => m.id !== id);
        setMoods(filtered);
        await saveMoods(filtered);
        console.log("🗑️ Humor removido:", id);
      } catch (e) {
        console.error("Erro ao remover humor:", e);
        Alert.alert("Erro", "Não foi possível remover o registro.");
      }
    },
    [moods, setMoods, saveMoods]
  );

  // -----------------------------------------------------------
  // Limpar todos
  // -----------------------------------------------------------
  const clearMoods = useCallback(async () => {
    try {
      setMoods([]);
      await saveMoods([]);
      console.log("🧹 Registros de humor limpos.");
    } catch (e) {
      console.error("Erro ao limpar moods:", e);
    }
  }, [setMoods, saveMoods]);

  // -----------------------------------------------------------
  // Últimos 7 dias
  // -----------------------------------------------------------
  const getLast7Days = useCallback(() => {
    const now = new Date();
    return moods.filter((m) => {
      const diff =
        (now.getTime() - new Date(m.date).getTime()) /
        (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
  }, [moods]);

  // -----------------------------------------------------------
  // Média diária
  // -----------------------------------------------------------
  const getDailyAverage = useCallback(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    for (const mood of moods) {
      if (!grouped[mood.date]) grouped[mood.date] = { total: 0, count: 0 };
      grouped[mood.date].total += mood.rating;
      grouped[mood.date].count += 1;
    }
    return Object.entries(grouped).map(([date, { total, count }]) => ({
      date,
      avg: parseFloat((total / count).toFixed(2)),
    }));
  }, [moods]);

  // -----------------------------------------------------------
  // Último humor
  // -----------------------------------------------------------
  const lastMood = useMemo(() => {
    if (!moods.length) return null;
    const sorted = [...moods].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  }, [moods]);

  // -----------------------------------------------------------
  // Último humor por período
  // -----------------------------------------------------------
  const lastMoodByPeriod = useMemo(() => {
    const result: Partial<Record<MoodEntry["period"], MoodEntry>> = {};
    (["morning", "afternoon", "night"] as MoodEntry["period"][]).forEach(
      (period) => {
        result[period] = [...moods]
          .filter((m) => m.period === period)
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
      }
    );
    return result;
  }, [moods]);

  return {
    moods,
    loading,
    addMood,
    deleteMood,
    clearMoods,
    getLast7Days,
    getDailyAverage,
    lastMood,
    lastMoodByPeriod,

    // ⭐ novos:
    xp: moodStats?.xp ?? 0,
    streak: moodStats?.streak ?? 0,
  };
}

// ----------------------------------------------------------------
// Notificações automáticas de humor
// ----------------------------------------------------------------
export function useMoodPrompts() {
  useEffect(() => {
    (async () => {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      const alreadyScheduled = scheduled.some((n) =>
        n.content?.title?.includes("Como você está se sentindo?")
      );
      if (alreadyScheduled) return;

      const prompts = [
        { hour: 9, minute: 0, label: "da manhã" },
        { hour: 14, minute: 0, label: "da tarde" },
        { hour: 20, minute: 0, label: "da noite" },
      ];

      for (const { hour, minute, label } of prompts) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Como você está se sentindo?",
            body: `Registre seu humor ${label}.`,
            sound: false, // ⭐ sem som
            vibrate: [200], // ⭐ vibração curtinha
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }

      console.log("🕒 Lembretes diários de humor agendados.");
    })();
  }, []);
}

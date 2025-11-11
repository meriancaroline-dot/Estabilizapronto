// src/hooks/useMood.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useStorage } from "./useStorage";

// -------------------------------------------------------------
// Tipo do humor + clima + estação
// -------------------------------------------------------------
export type MoodEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  period: "morning" | "afternoon" | "night";
  mood: string; // Ex: "Muito feliz"
  emoji: string; // Ex: "😁"
  rating: number; // 1–5 (interno, pra estatísticas)
  climate?: "quente" | "frio" | "chuvoso" | "nublado" | "ensolarado";
  season?: "verão" | "outono" | "inverno" | "primavera";
};

// -------------------------------------------------------------
// Helper: estação do ano (aproximação hemisfério sul)
// -------------------------------------------------------------
function getSeason(date: Date): MoodEntry["season"] {
  const month = date.getMonth() + 1; // 1–12

  // Aproximação simples BR:
  // Verão: Dez, Jan, Fev
  // Outono: Mar, Abr, Mai
  // Inverno: Jun, Jul, Ago
  // Primavera: Set, Out, Nov
  if (month === 12 || month === 1 || month === 2) return "verão";
  if (month === 3 || month === 4 || month === 5) return "outono";
  if (month === 6 || month === 7 || month === 8) return "inverno";
  return "primavera";
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useMood() {
  const {
    value: moods,
    setValue: setMoods,
    save: saveMoods,
    load: loadMoods,
  } = useStorage<MoodEntry[]>({
    key: "moods",
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar registros salvos
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        await loadMoods();
      } catch (e) {
        console.error("Erro ao carregar moods:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMoods]);

  // -----------------------------------------------------------
  // Adiciona ou atualiza o humor de um período do dia
  // -----------------------------------------------------------
  const addMood = useCallback(
    async (
      period: MoodEntry["period"],
      mood: string,
      emoji: string,
      rating: number,
      climate?: MoodEntry["climate"]
    ) => {
      try {
        const now = new Date();
        const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
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
        };

        const updated = existing
          ? moods.map((m) => (m.id === existing.id ? newEntry : m))
          : [...moods, newEntry];

        if (JSON.stringify(moods) !== JSON.stringify(updated)) {
          setMoods(updated);
          await saveMoods(updated);
          console.log(
            `🧠 Humor salvo (${period}) — ${mood}${
              climate ? ` | clima: ${climate}` : ""
            } | estação: ${season}`
          );
        }
      } catch (e) {
        console.error("Erro ao adicionar humor:", e);
        Alert.alert("Erro", "Não foi possível registrar o humor.");
      }
    },
    [moods, setMoods, saveMoods]
  );

  // -----------------------------------------------------------
  // Excluir humor específico
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
  // Limpar todos os registros
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
  // Últimos 7 dias (pra gráficos/análises)
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
  // Média diária (data -> média de rating)
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
  // Último humor registrado
  // -----------------------------------------------------------
  const lastMood = useMemo(() => {
    if (!moods.length) return null;
    const sorted = [...moods].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  }, [moods]);

  // -----------------------------------------------------------
  // Último humor por período (manhã/tarde/noite)
  // -----------------------------------------------------------
  const lastMoodByPeriod = useMemo(() => {
    const result: Partial<Record<MoodEntry["period"], MoodEntry>> = {};
    (["morning", "afternoon", "night"] as MoodEntry["period"][]).forEach(
      (period) => {
        result[period] = [...moods]
          .filter((m) => m.period === period)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
  };
}

// src/hooks/useStats.ts
import { useEffect, useMemo, useState } from "react";
import { useHabits } from "./useHabits";
import { useReminders } from "./useReminders";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useTasks } from "./useTasks";
import { useMood, MoodEntry } from "./useMood";
import { AppStats } from "@/types/models";

// -------------------------------------------------------------
// Tipos auxiliares para análise de clima/estação
// -------------------------------------------------------------
type ClimateInsights = {
  dominantClimate: string | null;
  climates: {
    key: NonNullable<MoodEntry["climate"]>;
    label: string;
    count: number;
    avgMood: number;
  }[];
};

type SeasonInsights = {
  dominantSeason: string | null;
  seasons: {
    key: NonNullable<MoodEntry["season"]>;
    label: string;
    count: number;
    avgMood: number;
  }[];
};

// Mapas de rótulos (texto amigável)
const CLIMATE_LABELS: Record<
  NonNullable<MoodEntry["climate"]>,
  string
> = {
  ensolarado: "dias ensolarados",
  nublado: "dias nublados",
  chuvoso: "dias chuvosos",
  frio: "dias frios",
  quente: "dias quentes",
};

const SEASON_LABELS: Record<
  NonNullable<MoodEntry["season"]>,
  string
> = {
  verão: "verão",
  outono: "outono",
  inverno: "inverno",
  primavera: "primavera",
};

// Converte média numérica de humor em nome qualitativo
function moodScoreToName(score: number): string {
  if (score >= 4.5) return "muito leve e positivo";
  if (score >= 3.8) return "positivo";
  if (score >= 3.0) return "equilibrado";
  if (score >= 2.2) return "sensível";
  if (score > 0) return "mais fragilizado";
  return "indefinido";
}

// -------------------------------------------------------------
// Hook principal — estatísticas globais, diárias, semanais e mensais
// + análise de clima/estação
// -------------------------------------------------------------
export function useStats() {
  const { habits } = useHabits();
  const { reminders } = useReminders();
  const { achievements } = useAchievements();
  const { tasks } = useTasks();
  const { moods } = useMood();

  const [stats, setStats] = useState<AppStats>({
    totalReminders: 0,
    completedReminders: 0,
    totalHabits: 0,
    activeHabits: 0,
    totalTasks: 0,
    completedTasks: 0,
    moodAverage: 0,
    streakLongest: 0,
    generatedAt: new Date().toISOString(),
  });

  const [statsDaily, setStatsDaily] = useState<AppStats | null>(null);
  const [statsWeekly, setStatsWeekly] = useState<AppStats | null>(null);
  const [statsMonthly, setStatsMonthly] = useState<AppStats | null>(null);

  // -----------------------------------------------------------
  // Função auxiliar: filtra dados por número de dias
  // -----------------------------------------------------------
  const filterByDays = (arr: any[], days: number): any[] => {
    const now = new Date();
    const limit = new Date(now.getTime() - days * 86400000);
    return arr.filter((item) => {
      const dateRaw =
        (item as any).createdAt ??
        (item as any).date ??
        (item as any).updatedAt ??
        now.toISOString();
      const date = new Date(dateRaw);
      return date >= limit;
    });
  };

  // -----------------------------------------------------------
  // Estatísticas globais
  // -----------------------------------------------------------
  useEffect(() => {
    const totalReminders = reminders.length;
    const completedReminders = reminders.filter((r) => r.isCompleted).length;

    const totalHabits = habits.length;
    const activeHabits = habits.filter(
      (h) => (h as any).streak && (h as any).streak > 0
    ).length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;

    const moodAverage =
      moods.length > 0
        ? Number(
            (
              moods.reduce((sum, m) => sum + (m.rating ?? 0), 0) /
              moods.length
            ).toFixed(2)
          )
        : 0;

    const streakLongest =
      habits.length > 0
        ? Math.max(
            ...habits.map((h) => Number((h as any).streak ?? 0) || 0)
          )
        : 0;

    setStats((prev) => ({
      ...prev,
      totalReminders,
      completedReminders,
      totalHabits,
      activeHabits,
      totalTasks,
      completedTasks,
      moodAverage,
      streakLongest,
      generatedAt: prev.generatedAt,
    }));
  }, [habits, reminders, achievements, tasks, moods]);

  // -----------------------------------------------------------
  // Estatísticas diária / semanal / mensal
  // -----------------------------------------------------------
  useEffect(() => {
    const compute = (
      r: any[],
      t: any[],
      h: any[],
      m: MoodEntry[]
    ): AppStats => {
      const moodAvg =
        m.length > 0
          ? Number(
              (
                m.reduce((sum, x) => sum + (x.rating ?? 0), 0) / m.length
              ).toFixed(2)
            )
          : 0;

      const longest =
        h.length > 0
          ? Math.max(
              ...h.map((x) => Number((x as any).streak ?? 0) || 0)
            )
          : 0;

      return {
        totalReminders: r.length,
        completedReminders: r.filter((x) => x.isCompleted).length,
        totalHabits: h.length,
        activeHabits: h.filter(
          (x) => (x as any).streak && (x as any).streak > 0
        ).length,
        totalTasks: t.length,
        completedTasks: t.filter((x) => x.completed).length,
        moodAverage: moodAvg,
        streakLongest: longest,
        generatedAt: new Date().toISOString(),
      };
    };

    const dailyReminders = filterByDays(reminders, 1);
    const weeklyReminders = filterByDays(reminders, 7);
    const monthlyReminders = filterByDays(reminders, 30);

    const dailyTasks = filterByDays(tasks, 1);
    const weeklyTasks = filterByDays(tasks, 7);
    const monthlyTasks = filterByDays(tasks, 30);

    const dailyHabits = filterByDays(habits, 1);
    const weeklyHabits = filterByDays(habits, 7);
    const monthlyHabits = filterByDays(habits, 30);

    const dailyMoods = filterByDays(moods, 1) as MoodEntry[];
    const weeklyMoods = filterByDays(moods, 7) as MoodEntry[];
    const monthlyMoods = filterByDays(moods, 30) as MoodEntry[];

    setStatsDaily(
      compute(dailyReminders, dailyTasks, dailyHabits, dailyMoods)
    );
    setStatsWeekly(
      compute(weeklyReminders, weeklyTasks, weeklyHabits, weeklyMoods)
    );
    setStatsMonthly(
      compute(monthlyReminders, monthlyTasks, monthlyHabits, monthlyMoods)
    );
  }, [habits, reminders, tasks, moods]);

  // -----------------------------------------------------------
  // Taxas de conclusão globais
  // -----------------------------------------------------------
  const completionRates = useMemo(() => {
    const reminderRate =
      stats.totalReminders > 0
        ? (stats.completedReminders / stats.totalReminders) * 100
        : 0;

    const taskRate =
      stats.totalTasks > 0
        ? (stats.completedTasks / stats.totalTasks) * 100
        : 0;

    const habitConsistency =
      stats.totalHabits > 0
        ? (stats.activeHabits / stats.totalHabits) * 100
        : 0;

    return {
      reminderRate: Math.round(reminderRate),
      taskRate: Math.round(taskRate),
      habitConsistency: Math.round(habitConsistency),
    };
  }, [stats]);

  // -----------------------------------------------------------
  // Resumo textual global
  // -----------------------------------------------------------
  const summary = useMemo(() => {
    return {
      performance: `${completionRates.taskRate}% das suas tarefas foram concluídas no período avaliado.`,
      consistency: `Você manteve aproximadamente ${completionRates.habitConsistency}% de consistência nos seus hábitos.`,
      mood:
        stats.moodAverage && stats.moodAverage > 0
          ? `De forma geral, seu humor médio ficou em uma faixa considerada ${moodScoreToName(
              stats.moodAverage
            )}.`
          : "Ainda não há dados suficientes de humor para uma leitura mais precisa.",
    };
  }, [completionRates, stats]);

  // -----------------------------------------------------------
  // Comparativo semanal x mensal (percentual)
  // -----------------------------------------------------------
  const comparison = useMemo(() => {
    if (!statsWeekly || !statsMonthly) return null;

    const pct = (a: number, b: number): number =>
      b > 0 ? Number((((a - b) / b) * 100).toFixed(1)) : 0;

    return {
      tasks: pct(
        statsWeekly.completedTasks ?? 0,
        statsMonthly.completedTasks ?? 0
      ),
      reminders: pct(
        statsWeekly.completedReminders ?? 0,
        statsMonthly.completedReminders ?? 0
      ),
      habits: pct(
        statsWeekly.activeHabits ?? 0,
        statsMonthly.activeHabits ?? 0
      ),
      mood: pct(statsWeekly.moodAverage ?? 0, statsMonthly.moodAverage ?? 0),
    };
  }, [statsWeekly, statsMonthly]);

  // -----------------------------------------------------------
  // Análise de clima
  // -----------------------------------------------------------
  const climateInsights = useMemo<ClimateInsights | null>(() => {
    const relevant = moods.filter((m) => m.climate) as (MoodEntry & {
      climate: NonNullable<MoodEntry["climate"]>;
    })[];

    if (!relevant.length) return null;

    const counts: Record<
      NonNullable<MoodEntry["climate"]>,
      { count: number; totalMood: number }
    > = {} as any;

    for (const m of relevant) {
      if (!counts[m.climate]) {
        counts[m.climate] = { count: 0, totalMood: 0 };
      }
      counts[m.climate].count += 1;
      counts[m.climate].totalMood += m.rating ?? 0;
    }

    const climates = (Object.keys(counts) as NonNullable<
      MoodEntry["climate"]
    >[]).map((key) => {
      const { count, totalMood } = counts[key];
      return {
        key,
        label: CLIMATE_LABELS[key],
        count,
        avgMood: count > 0 ? Number((totalMood / count).toFixed(2)) : 0,
      };
    });

    climates.sort((a, b) => b.count - a.count);

    return {
      dominantClimate: climates[0]?.key ?? null,
      climates,
    };
  }, [moods]);

  // -----------------------------------------------------------
  // Análise de estação
  // -----------------------------------------------------------
  const seasonInsights = useMemo<SeasonInsights | null>(() => {
    const relevant = moods.filter((m) => m.season) as (MoodEntry & {
      season: NonNullable<MoodEntry["season"]>;
    })[];

    if (!relevant.length) return null;

    const counts: Record<
      NonNullable<MoodEntry["season"]>,
      { count: number; totalMood: number }
    > = {} as any;

    for (const m of relevant) {
      if (!counts[m.season]) {
        counts[m.season] = { count: 0, totalMood: 0 };
      }
      counts[m.season].count += 1;
      counts[m.season].totalMood += m.rating ?? 0;
    }

    const seasons = (Object.keys(counts) as NonNullable<
      MoodEntry["season"]
    >[]).map((key) => {
      const { count, totalMood } = counts[key];
      return {
        key,
        label: SEASON_LABELS[key],
        count,
        avgMood: count > 0 ? Number((totalMood / count).toFixed(2)) : 0,
      };
    });

    seasons.sort((a, b) => b.count - a.count);

    return {
      dominantSeason: seasons[0]?.key ?? null,
      seasons,
    };
  }, [moods]);

  // -----------------------------------------------------------
  // Auxiliar para PDF: ritmo de atividade (tarefas+lembretes+hábitos)
  // -----------------------------------------------------------
  const activityLevels = useMemo(() => {
    const calc = (s: AppStats | null): number => {
      if (!s) return 0;
      return (
        (s.completedTasks ?? 0) +
        (s.completedReminders ?? 0) +
        (s.activeHabits ?? 0)
      );
    };

    const daily = calc(statsDaily);
    const weekly = calc(statsWeekly);
    const monthly = calc(statsMonthly);
    const max = Math.max(daily, weekly, monthly, 1);

    return {
      raw: { daily, weekly, monthly },
      relative: {
        daily: Math.round((daily / max) * 100),
        weekly: Math.round((weekly / max) * 100),
        monthly: Math.round((monthly / max) * 100),
      },
    };
  }, [statsDaily, statsWeekly, statsMonthly]);

  return {
    stats,
    completionRates,
    summary,
    statsDaily,
    statsWeekly,
    statsMonthly,
    comparison,
    climateInsights,
    seasonInsights,
    activityLevels,
  };
}

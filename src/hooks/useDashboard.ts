import { useMemo } from "react";
import { useStats } from "@/hooks/useStats";
import { useTheme } from "@/hooks/useTheme";
import type { RootTabParamList } from "@/navigation/types";
import { AppStats } from "@/types/models";

// -------------------------------------------------------------
// Tipos auxiliares
// -------------------------------------------------------------
export type DashboardCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: string;
};

export type Shortcut = {
  id: string;
  label: string;
  icon: string;
  target: keyof RootTabParamList;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

// -------------------------------------------------------------
// Hook principal — gera todos os dados do Dashboard
// -------------------------------------------------------------
export function useDashboard() {
  // useStats não tem isLoading/error, então criamos defaults
  const { stats, completionRates, summary } = useStats();
  const isLoading = false;
  const error = null;
  const { theme } = useTheme();

  // -----------------------------------------------------------
  // Cards principais
  // -----------------------------------------------------------
  const cards: DashboardCard[] = useMemo(() => {
    const list: DashboardCard[] = [
      {
        id: "tasks",
        title: "Tarefas Concluídas",
        value: `${completionRates.taskRate ?? 0}%`,
        subtitle: `${stats.completedTasks}/${stats.totalTasks}`,
        color: theme.colors.success,
        icon: "checkmark-done-outline",
      },
      {
        id: "habits",
        title: "Consistência de Hábitos",
        value: `${completionRates.habitConsistency ?? 0}%`,
        subtitle: `${stats.activeHabits}/${stats.totalHabits}`,
        color: theme.colors.primary,
        icon: "repeat-outline",
      },
      {
        id: "reminders",
        title: "Lembretes Cumpridos",
        value: `${completionRates.reminderRate ?? 0}%`,
        subtitle: `${stats.completedReminders}/${stats.totalReminders}`,
        color: theme.colors.secondary,
        icon: "notifications-outline",
      },
      {
        id: "mood",
        title: "Média de Humor",
        value:
          stats.moodAverage && stats.moodAverage > 0
            ? `${stats.moodAverage.toFixed(1)}/5`
            : "—",
        subtitle: "Últimos registros",
        color: theme.colors.warning,
        icon: "happy-outline",
      },
    ];
    return list.filter((c) => c.value !== "—" || c.subtitle !== "0/0");
  }, [completionRates, stats, theme.colors]);

  // -----------------------------------------------------------
  // Dados para gráfico
  // -----------------------------------------------------------
  const chartData = useMemo(
    () => [
      {
        label: "Tarefas",
        value: completionRates.taskRate ?? 0,
        color: theme.colors.success,
      },
      {
        label: "Hábitos",
        value: completionRates.habitConsistency ?? 0,
        color: theme.colors.primary,
      },
      {
        label: "Lembretes",
        value: completionRates.reminderRate ?? 0,
        color: theme.colors.secondary,
      },
    ],
    [completionRates, theme.colors]
  );

  // -----------------------------------------------------------
  // Atalhos rápidos
  // -----------------------------------------------------------
  const shortcuts: Shortcut[] = [
    { id: "1", label: "Humor", icon: "happy-outline", target: "Mood" },
    { id: "2", label: "Lembretes", icon: "notifications-outline", target: "Reminders" },
    { id: "3", label: "Hábitos", icon: "repeat-outline", target: "Habits" },
    { id: "4", label: "Notas", icon: "document-text-outline", target: "Notes" },
    { id: "5", label: "Profissionais", icon: "people-outline", target: "Professionals" },
    { id: "6", label: "Estatísticas", icon: "bar-chart-outline", target: "Stats" },
  ];

  // -----------------------------------------------------------
  // Dicas motivacionais
  // -----------------------------------------------------------
  const tips = useMemo(() => {
    const base = [
      "Mantenha pequenas vitórias diárias.",
      "Reflita sobre seu humor e celebre o equilíbrio.",
      "Hábitos consistentes valem mais do que intensos.",
      "Respire fundo. O progresso não precisa ser perfeito.",
      "Reveja suas metas com gentileza, não com culpa.",
    ];

    if ((completionRates.taskRate ?? 0) > 80) {
      base.unshift("Excelente progresso! Continue firme!");
    }
    if ((stats.streakLongest ?? 0) >= 7) {
      base.unshift("🔥 Uma semana de consistência! Incrível!");
    }

    return base.slice(0, 5);
  }, [completionRates.taskRate, stats.streakLongest]);

  // -----------------------------------------------------------
  // Conquistas — convertidas para strings pra compatibilidade
  // -----------------------------------------------------------
  const achievements: string[] = useMemo(
    () => [
      "🔥 Uma semana de constância!",
      "🏆 100 tarefas concluídas!",
      "💫 Humor equilibrado por 5 dias seguidos!",
    ],
    []
  );

  // -----------------------------------------------------------
  // Última atualização
  // -----------------------------------------------------------
  const lastUpdated = useMemo(() => {
    const date = stats.generatedAt
      ? new Date(stats.generatedAt).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";
    return `Atualizado em ${date}`;
  }, [stats.generatedAt]);

  // -----------------------------------------------------------
  // Verifica se há dados
  // -----------------------------------------------------------
  const hasData = useMemo(() => {
    return (
      (stats.totalTasks ?? 0) +
        (stats.totalHabits ?? 0) +
        (stats.totalReminders ?? 0) >
      0
    );
  }, [stats]);

  // -----------------------------------------------------------
  // Retorno final
  // -----------------------------------------------------------
  return {
    isLoading,
    error,
    cards,
    chartData,
    summary,
    shortcuts,
    tips,
    achievements,
    lastUpdated,
    hasData,
    stats: stats as AppStats,
  };
}

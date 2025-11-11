// src/hooks/useDashboardUI.ts
import { useMemo } from "react";
import { useStats } from "@/hooks/useStats";
import { useTheme } from "@/hooks/useTheme";
import type { RootTabParamList } from "@/navigation/types";

type Shortcut = {
  label: string;
  icon: string;
  target: keyof RootTabParamList;
};

export function useDashboardUI() {
  const { stats, completionRates, summary } = useStats();
  const { theme } = useTheme();

  const sections = useMemo(
    () => [
      {
        title: "Tarefas e Hábitos",
        data: [
          {
            label: "Tarefas concluídas",
            value: `${completionRates.taskRate ?? 0}%`,
            color: theme.colors.primary,
          },
          {
            label: "Consistência de hábitos",
            value: `${completionRates.habitConsistency ?? 0}%`,
            color: theme.colors.success,
          },
          {
            label: "Lembretes cumpridos",
            value: `${completionRates.reminderRate ?? 0}%`,
            color: theme.colors.secondary,
          },
        ],
      },
      {
        title: "Humor e Progresso",
        data: [
          {
            label: "Média de humor",
            value: `${stats.moodAverage?.toFixed(1) ?? "0.0"}/5`,
            color: theme.colors.warning,
          },
          {
            label: "Maior sequência",
            value: `${stats.streakLongest ?? 0}`,
            color: theme.colors.success,
          },
        ],
      },
    ],
    [completionRates, stats, theme.colors]
  );

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

  // 👇 Alvos em inglês (iguais às rotas), rótulos em português
  const shortcuts: Shortcut[] = [
    { label: "Humor", icon: "happy-outline", target: "Mood" },
    { label: "Lembretes", icon: "notifications-outline", target: "Reminders" },
    { label: "Hábitos", icon: "repeat-outline", target: "Habits" },
    { label: "Notas", icon: "document-text-outline", target: "Notes" },
    { label: "Profissionais", icon: "people-outline", target: "Professionals" },
    { label: "Estatísticas", icon: "bar-chart-outline", target: "Stats" },
  ];

  const safeSummary =
    summary || ({
      performance: "—",
      consistency: "—",
      mood: "—",
    } as const);

  return {
    stats,
    sections,
    summary: safeSummary,
    tips,
    shortcuts,
  };
}

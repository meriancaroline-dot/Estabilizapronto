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

  // -----------------------------------------------------------
  // Seções de estatísticas (cards textuais)
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // Dicas
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
  // Atalhos rápidos
  // -----------------------------------------------------------
  const shortcuts: Shortcut[] = [
    { label: "Humor", icon: "happy-outline", target: "Mood" },
    { label: "Lembretes", icon: "notifications-outline", target: "Reminders" },
    { label: "Hábitos", icon: "repeat-outline", target: "Habits" },
    { label: "Notas", icon: "document-text-outline", target: "Notes" },
    { label: "Profissionais", icon: "people-outline", target: "Professionals" },
    { label: "Estatísticas", icon: "bar-chart-outline", target: "Stats" },
  ];

  // -----------------------------------------------------------
  // Summary “seguro” pro Dashboard
  // -> transforma as frases do useStats em números de 0–100
  // -----------------------------------------------------------
  const safeSummary = useMemo(() => {
    const raw = summary ?? {
      performance: "",
      consistency: "",
      mood: "",
    };

    const extractPercent = (text: string | undefined): string => {
      if (!text) return "0";

      // tenta pegar o primeiro "NN%"
      const match = text.match(/(\d+)\s*%/);
      if (match) return match[1];

      // fallback: arranca tudo que não é número/sinal/ponto e tenta converter
      const cleaned = text
        .replace(",", ".")
        .replace(/[^0-9.-]/g, "");
      const num = Number(cleaned);

      if (!Number.isFinite(num)) return "0";

      // clamp 0–100 e arredonda
      const clamped = Math.max(0, Math.min(100, Math.round(num)));
      return String(clamped);
    };

    return {
      performance: extractPercent(raw.performance),
      consistency: extractPercent(raw.consistency),
      // mood continua descritivo, não entra nos cards de % do dashboard
      mood: raw.mood ?? "",
    };
  }, [summary]);

  return {
    stats,
    sections,
    summary: safeSummary,
    tips,
    shortcuts,
  };
}

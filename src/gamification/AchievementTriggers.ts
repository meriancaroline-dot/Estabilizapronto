// -------------------------------------------------------------
// src/gamification/AchievementTriggers.ts
// -------------------------------------------------------------
// Não mexe no AchievementsContext original — só usa!
// -------------------------------------------------------------

import { useAchievements } from "@/contexts/AchievementsContext";
import { gamification } from "./GamificationEngine";
import { useEffect } from "react";

export function useAchievementTriggers() {
  const { achievements, unlockAchievement, addAchievement } = useAchievements();

  // Helper: pega conquista por ID (pra não depender de título)
  const find = (id: string) => achievements.find((a) => a.id === id);

  // Helper pra criar conquistas de tier sem duplicar
  const ensureTierAchievement = (
    condition: boolean,
    title: string,
    description: string,
    icon: string
  ) => {
    if (!condition) return;

    const exists = achievements.some((a) => a.title === title);
    if (exists) return;

    // cria conquista já 100% concluída
    void addAchievement({
      title,
      description,
      icon,
      progress: 100,
      userId: "system",
    }).catch((e) => {
      console.log("Erro ao criar conquista automática:", e);
    });
  };

  // Dispara triggers sempre que stats mudarem / conquistas mudarem
  useEffect(() => {
    const stats = gamification.stats;

    // -----------------------------------------------------------------
    // 🧱 CONQUISTAS FIXAS QUE VOCÊ JÁ TINHA (se existirem no storage)
    // -----------------------------------------------------------------

    // 1️⃣ PRIMEIRO REGISTRO DE HUMOR
    if (stats.moodCount === 1) {
      const ach = find("first_mood");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 2️⃣ 7 DIAS DE STREAK DE HUMOR
    if (stats.moodStreak >= 7) {
      const ach = find("mood_streak_7");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 3️⃣ PRIMEIRO HÁBITO CONCLUÍDO
    if (stats.habitsCompleted === 1) {
      const ach = find("first_habit");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 4️⃣ 10 HÁBITOS CONCLUÍDOS
    if (stats.habitsCompleted >= 10) {
      const ach = find("habits_10");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 5️⃣ PRIMEIRA NOTA
    if (stats.notesCreated === 1) {
      const ach = find("first_note");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 6️⃣ 5 NOTAS
    if (stats.notesCreated >= 5) {
      const ach = find("notes_5");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 7️⃣ PRIMEIRO LEMBRETE CONCLUÍDO
    if (stats.remindersCompleted === 1) {
      const ach = find("first_reminder");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // 8️⃣ 10 LEMBRETES CONCLUÍDOS
    if (stats.remindersCompleted >= 10) {
      const ach = find("reminder_10");
      if (ach && !ach.unlockedAt) unlockAchievement(ach.id);
    }

    // -----------------------------------------------------------------
    // 🌈 CONQUISTAS INFINITAS AUTOMÁTICAS (OPÇÃO B)
    // -----------------------------------------------------------------
    const s = stats;

    // Humor — quantidade total
    [10, 30, 60, 120, 240, 480].forEach((n) => {
      ensureTierAchievement(
        s.moodCount >= n,
        `Humor — ${n} registros`,
        `Você registrou seu humor ${n} vezes.`,
        "🧠"
      );
    });

    // Humor — streak
    [3, 7, 14, 21, 30, 45, 60].forEach((n) => {
      ensureTierAchievement(
        s.moodStreak >= n,
        `Streak de humor — ${n} dias`,
        `Você manteve uma sequência de ${n} dias registrando seu humor.`,
        "🔥"
      );
    });

    // Hábitos concluídos
    [5, 10, 25, 50, 100, 200, 400].forEach((n) => {
      ensureTierAchievement(
        s.habitsCompleted >= n,
        `Hábitos — ${n} concluídos`,
        `Você concluiu ${n} hábitos.`,
        "✅"
      );
    });

    // Notas criadas
    [5, 15, 30, 60, 120, 240].forEach((n) => {
      ensureTierAchievement(
        s.notesCreated >= n,
        `Notas — ${n} criadas`,
        `Você criou ${n} notas.`,
        "📒"
      );
    });

    // Lembretes concluídos
    [1, 5, 15, 30, 60, 120].forEach((n) => {
      ensureTierAchievement(
        s.remindersCompleted >= n,
        `Lembretes — ${n} concluídos`,
        `Você concluiu ${n} lembretes.`,
        "⏰"
      );
    });
  }, [achievements, unlockAchievement, addAchievement]);
}

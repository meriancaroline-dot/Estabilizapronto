// -------------------------------------------------------------
// src/hooks/useNotificationsDashboard.ts
// -------------------------------------------------------------
import { useEffect, useMemo } from "react";
import * as Notifications from "expo-notifications";
import { useHabits } from "./useHabits";
import { useReminders } from "./useReminders";
import { useMood } from "./useMood";
import { useStats } from "./useStats";

export function useNotificationsDashboard() {
  const { habits } = useHabits();
  const { reminders } = useReminders();
  const { moods } = useMood();
  const { stats } = useStats();

  // -----------------------------------------------------------
  // Regras de comportamento
  // -----------------------------------------------------------
  const shouldEncourageHabit = useMemo(() => {
    const inactive = habits.filter((h) => (h.streak ?? 0) === 0).length;
    return inactive > 2;
  }, [habits]);

  const shouldRemindTasks = useMemo(() => {
    const pending = reminders.filter((r) => !r.isCompleted).length;
    return pending > 0;
  }, [reminders]);

  const shouldSendMoodCheck = useMemo(() => {
    if (!moods.length) return true;
    const last = moods[moods.length - 1];
    if (!last?.date) return true;
    const lastDate = new Date(last.date);
    const diffHours = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  }, [moods]);

  // -----------------------------------------------------------
  // Agenda notificações — 1x por dia no máximo
  // -----------------------------------------------------------
  useEffect(() => {
    const scheduleNotifications = async () => {
      // Evita reagendar tudo a cada render
      const already = await Notifications.getAllScheduledNotificationsAsync();
      if (already.length > 0) return;

      const now = new Date();
      const baseHour = now.getHours();

      // dispara em horários diferentes do dia, não todos juntos
      const triggers = [
        { cond: shouldEncourageHabit, delayHours: 1 },
        { cond: shouldRemindTasks, delayHours: 2 },
        { cond: shouldSendMoodCheck, delayHours: 3 },
      ];

      for (const [index, { cond, delayHours }] of triggers.entries()) {
        if (!cond) continue;

        const fireDate = new Date(now);
        fireDate.setHours(baseHour + delayHours, 0, 0, 0);

        await Notifications.scheduleNotificationAsync({
          content: {
            title:
              index === 0
                ? "🔥 Mantenha o ritmo!"
                : index === 1
                ? "🕑 Tem lembretes pendentes!"
                : "💬 Como você está se sentindo hoje?",
            body:
              index === 0
                ? "Você tem alguns hábitos parados. Que tal recomeçar hoje?"
                : index === 1
                ? "Não se esqueça de concluir suas tarefas do dia."
                : "Registre seu humor pra acompanhar seu bem-estar.",
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireDate,
          },
        });
      }

      console.log("🔔 Notificações inteligentes agendadas com horários espaçados.");
    };

    scheduleNotifications();
  }, [shouldEncourageHabit, shouldRemindTasks, shouldSendMoodCheck]);

  const status = useMemo(() => {
    return {
      habitsLow: shouldEncourageHabit,
      remindersPending: shouldRemindTasks,
      moodMissing: shouldSendMoodCheck,
      generatedAt: stats.generatedAt,
    };
  }, [shouldEncourageHabit, shouldRemindTasks, shouldSendMoodCheck, stats.generatedAt]);

  return { status };
}

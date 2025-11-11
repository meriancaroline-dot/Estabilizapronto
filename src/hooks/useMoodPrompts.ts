import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export function useMoodPrompts() {
  useEffect(() => {
    (async () => {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      const alreadyScheduled = scheduled.some(
        (n) => n.content?.title?.includes("Como você está se sentindo?") // ✅ corrigido
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
            sound: true,
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

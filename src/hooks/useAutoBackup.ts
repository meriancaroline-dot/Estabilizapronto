// -------------------------------------------------------------
// src/hooks/useAutoBackup.ts
// -------------------------------------------------------------
// 🔄 Backup automático diário controlado pelas configurações
// -------------------------------------------------------------
import { useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { ensureNotificationChannel } from "@/services/Notifications";
import { useBackup } from "./useBackup";
import { useSettings } from "@/contexts/SettingsContext";

type FSLike = {
  documentDirectory?: string | null;
  readDirectoryAsync: (uri: string) => Promise<string[]>;
  deleteAsync: (uri: string, opts?: { idempotent?: boolean }) => Promise<void>;
};
const FS = FileSystem as unknown as FSLike;

export function useAutoBackup() {
  const { exportData } = useBackup();
  const { settings } = useSettings();

  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const DOCUMENT_DIR = (FS.documentDirectory ?? "") as string;

  const checkNotificationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) {
        setPermissionGranted(true);
        return true;
      }

      const { granted } = await Notifications.requestPermissionsAsync();
      setPermissionGranted(granted);

      if (!granted) {
        Alert.alert(
          "Permissão necessária",
          "Ative as notificações para receber alertas de backup automático."
        );
      }

      return granted;
    } catch (e) {
      console.error("Erro ao verificar permissão de notificações:", e);
      return false;
    }
  }, []);

  const runAutoBackup = useCallback(async () => {
    if (running || !settings.backupEnabled) return;

    try {
      setRunning(true);

      await exportData();

      const files = await FS.readDirectoryAsync(DOCUMENT_DIR);
      const autoBackups = files.filter((f) => f.startsWith("auto-backup-"));
      if (autoBackups.length > 7) {
        const sorted = autoBackups.sort().reverse();
        const old = sorted.slice(7);
        for (const f of old) {
          await FS.deleteAsync(`${DOCUMENT_DIR}${f}`, { idempotent: true });
        }
      }

      setLastAutoBackup(new Date().toISOString());
      console.log("🤖 Backup automático concluído");
    } catch (e) {
      console.error("Erro no backup automático:", e);
      Alert.alert("Erro", "Falha ao executar backup automático.");
    } finally {
      setRunning(false);
    }
  }, [exportData, running, settings.backupEnabled, DOCUMENT_DIR]);

  const scheduleBackupReminder = useCallback(async () => {
    if (!settings.backupEnabled) return;
    const granted = await checkNotificationPermission();
    if (!granted) return;

    try {
      await ensureNotificationChannel("backup", "default");
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧩 Backup diário",
          body: "Seu backup automático foi realizado ou está programado.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 22,
          minute: 0,
          channelId: "backup",
        },
      });

      console.log("🔔 Notificação diária de backup agendada às 22h.");
    } catch (e) {
      console.error("Erro ao agendar lembrete de backup:", e);
    }
  }, [settings.backupEnabled, checkNotificationPermission]);

  useEffect(() => {
    (async () => {
      if (settings.backupEnabled) {
        const granted = await checkNotificationPermission();
        if (granted) await scheduleBackupReminder();
      } else {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log("⚙️ Backup automático desativado nas configurações.");
      }
    })();

    const interval = setInterval(() => {
      if (!settings.backupEnabled) return;
      const hour = new Date().getHours();
      if (hour === 22) runAutoBackup();
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    settings.backupEnabled,
    runAutoBackup,
    scheduleBackupReminder,
    checkNotificationPermission,
  ]);

  return {
    lastAutoBackup,
    running,
    permissionGranted,
    runAutoBackup,
  };
}

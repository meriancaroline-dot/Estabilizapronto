// -------------------------------------------------------------
// src/hooks/useBackup.ts
// -------------------------------------------------------------
import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FS from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import {
  ExportData,
  AppSettings,
  Reminder,
  Task,
  Habit,
  Mood,
  Note,
  Achievement,
} from "@/types/models";

// 🔹 Tipagem forçada pra garantir compatibilidade com Expo 52
const FileSystem = FS as unknown as {
  writeAsStringAsync: (uri: string, data: string) => Promise<void>;
  readDirectoryAsync: (dir: string) => Promise<string[]>;
  readAsStringAsync: (uri: string) => Promise<string>;
  deleteAsync: (uri: string) => Promise<void>;
  documentDirectory: string;
};

// 🔹 Chaves do AsyncStorage
const STORAGE_KEYS = {
  reminders: "@estabiliza:reminders",
  tasks: "@estabiliza:tasks",
  habits: "@estabiliza:habits",
  moods: "@estabiliza:moods",
  notes: "@estabiliza:notes",
  achievements: "@estabiliza:achievements",
  settings: "@estabiliza:settings",
};

// -------------------------------------------------------------
// Hook de Backup
// -------------------------------------------------------------
export function useBackup(autoRestore = false) {
  const [loading, setLoading] = useState(false);
  const [lastBackupRestored, setLastBackupRestored] = useState(false);

  // ✅ Exporta tudo em um JSON bonito
  const exportData = useCallback(async () => {
    try {
      setLoading(true);

      const getData = async <T,>(key: string): Promise<T[]> => {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      };

      const reminders = await getData<Reminder>(STORAGE_KEYS.reminders);
      const tasks = await getData<Task>(STORAGE_KEYS.tasks);
      const habits = await getData<Habit>(STORAGE_KEYS.habits);
      const moods = await getData<Mood>(STORAGE_KEYS.moods);
      const notes = await getData<Note>(STORAGE_KEYS.notes);
      const achievements = await getData<Achievement>(STORAGE_KEYS.achievements);

      const settingsRaw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
      const settings: AppSettings = settingsRaw
        ? JSON.parse(settingsRaw)
        : {
            theme: "system",
            notificationsEnabled: true,
            backupEnabled: true,
            syncEnabled: true,
            language: "pt",
            updatedAt: new Date().toISOString(),
          };

      const exportObj: ExportData = {
        reminders,
        tasks,
        habits,
        moods,
        notes,
        achievements,
        settings,
        exportedAt: new Date().toISOString(),
      };

      const fileUri = `${FileSystem.documentDirectory}estabiliza_backup_${Date.now()}.json`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(exportObj, null, 2)
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Exportar backup do Estabiliza",
        });
      } else {
        Alert.alert("Backup gerado", "O arquivo foi salvo internamente.");
      }

      return true;
    } catch (e) {
      console.error("Erro ao exportar backup:", e);
      Alert.alert("Erro", "Não foi possível exportar o backup.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Importa backup a partir de JSON
  const importData = useCallback(async (jsonData: string) => {
    try {
      setLoading(true);
      const data: ExportData = JSON.parse(jsonData);

      const setData = async (key: string, value: any) =>
        AsyncStorage.setItem(key, JSON.stringify(value));

      await Promise.all([
        setData(STORAGE_KEYS.reminders, data.reminders),
        setData(STORAGE_KEYS.tasks, data.tasks),
        setData(STORAGE_KEYS.habits, data.habits),
        setData(STORAGE_KEYS.moods, data.moods),
        setData(STORAGE_KEYS.notes, data.notes),
        setData(STORAGE_KEYS.achievements, data.achievements),
        setData(STORAGE_KEYS.settings, data.settings),
      ]);

      console.log("✅ Backup importado automaticamente.");
      return true;
    } catch (e) {
      console.error("Erro ao importar backup:", e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Limpa backups antigos
  const clearOldBackups = useCallback(async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || "");
      const backups = files.filter((f) => f.startsWith("estabiliza_backup_"));
      for (const f of backups) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${f}`);
      }
    } catch (e) {
      console.error("Erro ao limpar backups antigos:", e);
    }
  }, []);

  // ✅ Busca o último backup salvo
  const getLastBackup = useCallback(async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || "");
      const backups = files.filter((f) => f.startsWith("estabiliza_backup_"));
      if (backups.length === 0) return null;

      const sorted = backups.sort((a, b) => {
        const aNum = parseInt(a.split("_")[2]);
        const bNum = parseInt(b.split("_")[2]);
        return bNum - aNum;
      });

      return `${FileSystem.documentDirectory}${sorted[0]}`;
    } catch (e) {
      console.error("Erro ao buscar último backup:", e);
      return null;
    }
  }, []);

  // ✅ Limpa todos os dados
  const clearAllData = useCallback(async () => {
    try {
      Alert.alert("Confirmação", "Deseja realmente apagar todos os dados?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: async () => {
            await Promise.all(
              Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
            );
            Alert.alert("Pronto", "Todos os dados foram apagados.");
          },
        },
      ]);
    } catch (e) {
      console.error("Erro ao limpar dados:", e);
    }
  }, []);

  // ✅ Restauração automática do último backup
  useEffect(() => {
    if (!autoRestore) return;

    (async () => {
      try {
        const hasData = await AsyncStorage.getItem(STORAGE_KEYS.tasks);
        if (hasData) {
          console.log("⚙️ Dados locais existentes, ignorando restauração automática.");
          return;
        }

        const last = await getLastBackup();
        if (!last) return;

        const json = await FileSystem.readAsStringAsync(last);
        const restored = await importData(json);
        if (restored) {
          console.log("✅ Restauração automática concluída.");
          setLastBackupRestored(true);
        }
      } catch (e) {
        console.error("Erro na restauração automática:", e);
      }
    })();
  }, [autoRestore, getLastBackup, importData]);

  return {
    exportData,
    importData,
    clearAllData,
    clearOldBackups,
    getLastBackup,
    loading,
    lastBackupRestored,
  };
}

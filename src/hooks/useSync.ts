// -------------------------------------------------------------
// src/hooks/useSync.ts
// -------------------------------------------------------------
// ☁️ Sincronização automática com Firebase Firestore (sem arquivos locais)
// -------------------------------------------------------------
import { useCallback, useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { useUser } from "@/contexts/UserContext";
import { useSettings } from "@/contexts/SettingsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ExportData,
  Reminder,
  Mood,
  Habit,
  Achievement,
  Task,
  Note,
  AppSettings,
  AppUser,
} from "@/types/models";

const STORAGE_KEYS = {
  reminders: "reminders",
  moods: "moods",
  habits: "habits",
  achievements: "achievements",
  tasks: "tasks",
  notes: "notes",
  user: "@estabiliza:user",
  settings: "@estabiliza:settings",
};

// -------------------------------------------------------------
// 🧱 Monta os dados para exportar
// -------------------------------------------------------------
async function buildExport(): Promise<ExportData> {
  const [
    remindersJson,
    moodsJson,
    habitsJson,
    achievementsJson,
    tasksJson,
    notesJson,
    userJson,
    settingsJson,
  ] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.reminders),
    AsyncStorage.getItem(STORAGE_KEYS.moods),
    AsyncStorage.getItem(STORAGE_KEYS.habits),
    AsyncStorage.getItem(STORAGE_KEYS.achievements),
    AsyncStorage.getItem(STORAGE_KEYS.tasks),
    AsyncStorage.getItem(STORAGE_KEYS.notes),
    AsyncStorage.getItem(STORAGE_KEYS.user),
    AsyncStorage.getItem(STORAGE_KEYS.settings),
  ]);

  const reminders: Reminder[] = remindersJson ? JSON.parse(remindersJson) : [];
  const moods: Mood[] = moodsJson ? JSON.parse(moodsJson) : [];
  const habits: Habit[] = habitsJson ? JSON.parse(habitsJson) : [];
  const achievements: Achievement[] = achievementsJson
    ? JSON.parse(achievementsJson)
    : [];
  const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
  const notes: Note[] = notesJson ? JSON.parse(notesJson) : [];

  const user: AppUser | undefined = userJson
    ? JSON.parse(userJson)
    : undefined; // ✅ corrigido (sem null)
  const settings: AppSettings = settingsJson
    ? JSON.parse(settingsJson)
    : {
        theme: "system",
        notificationsEnabled: true,
        backupEnabled: false,
        syncEnabled: true,
        language: "pt-BR",
        updatedAt: new Date().toISOString(),
      };

  const exportedAt = new Date().toISOString();

  return {
    reminders,
    moods,
    habits,
    achievements,
    tasks,
    notes,
    settings,
    user,
    exportedAt,
  };
}

// -------------------------------------------------------------
// 🧱 Aplica dados importados da nuvem
// -------------------------------------------------------------
async function applyExport(data: ExportData) {
  const entries: [string, string][] = [
    [STORAGE_KEYS.reminders, JSON.stringify(data.reminders ?? [])],
    [STORAGE_KEYS.moods, JSON.stringify(data.moods ?? [])],
    [STORAGE_KEYS.habits, JSON.stringify(data.habits ?? [])],
    [STORAGE_KEYS.achievements, JSON.stringify(data.achievements ?? [])],
    [STORAGE_KEYS.tasks, JSON.stringify(data.tasks ?? [])],
    [STORAGE_KEYS.notes, JSON.stringify(data.notes ?? [])],
  ];

  if (data.user) {
    entries.push([STORAGE_KEYS.user, JSON.stringify(data.user)]);
  }
  if (data.settings) {
    entries.push([STORAGE_KEYS.settings, JSON.stringify(data.settings)]);
  }

  await AsyncStorage.multiSet(entries);
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useSync() {
  const { user, isLoggedIn } = useUser();
  const { settings, updateSettings } = useSettings();

  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    (settings as any)?.lastCloudSync ?? null
  );

  // Detectar conexão
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) =>
      setIsOnline(!!state.isConnected)
    );
    return () => unsub();
  }, []);

  // -------------------------------------------------------------
  // ☁️ Envia dados locais ao Firestore
  // -------------------------------------------------------------
  const uploadToCloud = useCallback(
    async (data: ExportData) => {
      if (!user) return;

      const docRef = doc(db, "userBackups", user.id);
      await setDoc(docRef, {
        userId: user.id,
        updatedAt: new Date().toISOString(),
        data,
      });
    },
    [user]
  );

  // -------------------------------------------------------------
  // 📥 Baixa backup da nuvem
  // -------------------------------------------------------------
  const downloadFromCloud = useCallback(async () => {
    if (!user) return null;
    const docRef = doc(db, "userBackups", user.id);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as any) : null;
  }, [user]);

  // -------------------------------------------------------------
  // 🧹 Limpa backups antigos na nuvem
  // -------------------------------------------------------------
  const clearOldCloudBackups = useCallback(async () => {
    if (!user) return;
    try {
      const backupsRef = collection(db, "userBackups", user.id, "history");
      const snaps = await getDocs(backupsRef);
      const all = snaps.docs.map((d) => ({ id: d.id }));
      const old = all.slice(5);
      for (const b of old) await deleteDoc(doc(backupsRef, b.id));
      console.log(`🧹 ${old.length} backups antigos removidos da nuvem.`);
    } catch (e) {
      console.error("Erro limpando backups antigos:", e);
    }
  }, [user]);

  // -------------------------------------------------------------
  // 🚀 Sincronizar agora
  // -------------------------------------------------------------
  const syncNow = useCallback(async () => {
    if (!isLoggedIn || !isOnline || !settings.syncEnabled) return;

    try {
      setSyncing(true);
      const localData = await buildExport();
      const cloud = await downloadFromCloud();

      if (!cloud) {
        await uploadToCloud(localData);
      } else {
        const remoteUpdated = cloud.updatedAt ?? "2000-01-01T00:00:00.000Z";
        const localUpdated = localData.exportedAt;

        if (localUpdated > remoteUpdated) {
          await uploadToCloud(localData);
          console.log("☁️ Nuvem atualizada com dados locais.");
        } else if (remoteUpdated > localUpdated) {
          await applyExport(cloud.data);
          console.log("📥 Dados da nuvem aplicados localmente.");
        }
      }

      const nowIso = new Date().toISOString();
      setLastSync(nowIso);
      await updateSettings({ lastCloudSync: nowIso as any }); // ✅ tipagem coerente
      Alert.alert("Sincronizado", "Dados sincronizados com sucesso!");
    } catch (e) {
      console.error("Erro na sincronização:", e);
      Alert.alert("Erro", "Não foi possível sincronizar com a nuvem.");
    } finally {
      setSyncing(false);
    }
  }, [isLoggedIn, isOnline, settings.syncEnabled, uploadToCloud, downloadFromCloud]);

  // -------------------------------------------------------------
  // 🕒 Auto-sync periódico (30min)
  // -------------------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (!syncing && isOnline && isLoggedIn && settings.syncEnabled) {
        console.log("⏱️ Auto-sync em segundo plano...");
        syncNow();
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [syncNow, isOnline, isLoggedIn, syncing, settings.syncEnabled]);

  return {
    isOnline,
    syncing,
    lastSync,
    syncNow,
    clearOldCloudBackups,
  };
}

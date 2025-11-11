import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// -----------------------------
// Tipos
// -----------------------------
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  isCompleted: boolean;
  userId: string;
}

const STORAGE_KEY = '@estabiliza:reminders';
const STORAGE_NOTIF_KEY = '@estabiliza:reminders:notifications';

type ReminderId = string;
type NotificationId = string;
type ReminderNotificationMap = Record<ReminderId, NotificationId | undefined>;

// -----------------------------
// Validações
// -----------------------------
function isValidDateISO(date: string): boolean {
  const d = dayjs(date, 'YYYY-MM-DD', true);
  return d.isValid();
}

function isValidTimeHM(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

function assertReminderFields(reminder: Omit<Reminder, 'id' | 'isCompleted'>): void {
  if (!reminder.title?.trim()) throw new Error('Título é obrigatório.');
  if (!reminder.date || !isValidDateISO(reminder.date)) throw new Error('Data inválida.');
  if (!reminder.time || !isValidTimeHM(reminder.time)) throw new Error('Hora inválida.');
  if (!reminder.userId?.trim()) throw new Error('userId é obrigatório.');
}

// -----------------------------
// Utils de data/hora
// -----------------------------
function toDate(reminder: Pick<Reminder, 'date' | 'time'>): Date {
  const parts = reminder.time.split(':');
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  return dayjs(reminder.date).hour(h).minute(m).second(0).millisecond(0).toDate();
}

function isSameDay(a: string, b: string): boolean {
  return dayjs(a).isSame(b, 'day');
}

function isWithinNextDays(dateISO: string, days: number): boolean {
  const now = dayjs().startOf('day');
  const target = dayjs(dateISO).startOf('day');
  const diff = target.diff(now, 'day');
  return diff >= 0 && diff <= days;
}

function nextOccurrence(baseISO: string, repeat: Reminder['repeat']): string {
  const base = dayjs(baseISO);
  switch (repeat) {
    case 'daily':
      return base.add(1, 'day').format('YYYY-MM-DD');
    case 'weekly':
      return base.add(1, 'week').format('YYYY-MM-DD');
    case 'monthly':
      return base.add(1, 'month').format('YYYY-MM-DD');
    default:
      return baseISO;
  }
}

// -----------------------------
// Notificações
// -----------------------------
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Lembretes',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function requestNotifPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
  }
  return true;
}

async function scheduleReminderNotification(reminder: Reminder): Promise<NotificationId | undefined> {
  try {
    await requestNotifPermissions();
    await ensureAndroidChannel();

    const when = toDate(reminder);
    if (dayjs(when).isBefore(dayjs())) return undefined;

    const trigger: Notifications.NotificationTriggerInput = {
      date: when,
      channelId: 'reminders',
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete',
        body: reminder.description
          ? `${reminder.title} — ${reminder.description}`
          : reminder.title,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return id;
  } catch (e) {
    console.error('Falha ao agendar notificação:', e);
    return undefined;
  }
}

async function cancelNotification(id?: NotificationId): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    console.error('Falha ao cancelar notificação:', e);
  }
}

// -----------------------------
// Contexto
// -----------------------------
interface ReminderContextData {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  addReminder(reminder: Omit<Reminder, 'id' | 'isCompleted'>): Promise<Reminder>;
  updateReminder(id: string, data: Partial<Omit<Reminder, 'id' | 'userId'>>): Promise<Reminder>;
  deleteReminder(id: string): Promise<void>;
  toggleComplete(id: string): Promise<Reminder>;
  getUpcomingReminders(): Reminder[];
  getTodayReminders(): Reminder[];
  searchReminders(query: string): Reminder[];
  filterByCompleted(completed: boolean): Reminder[];
  refreshFromStorage(): Promise<void>;
}

const RemindersContext = createContext<ReminderContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const RemindersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifMap, setNotifMap] = useState<ReminderNotificationMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  const persist = useCallback(
    async (list: Reminder[], map: ReminderNotificationMap) => {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)),
        AsyncStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(map)),
      ]);
    },
    []
  );

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const [raw, rawMap] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(STORAGE_NOTIF_KEY),
      ]);
      const list: Reminder[] = raw ? JSON.parse(raw) : [];
      const map: ReminderNotificationMap = rawMap ? JSON.parse(rawMap) : {};
      list.sort((a, b) => toDate(a).getTime() - toDate(b).getTime());
      setReminders(list);
      setNotifMap(map);
    } catch (e) {
      console.error(e);
      setError('Falha ao carregar lembretes.');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    dayjs.locale('pt-br');
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (appState.current.match(/inactive|background/) && state === 'active') {
        loadFromStorage();
      }
      appState.current = state;
    });
    return () => sub.remove();
  }, [loadFromStorage]);

  const sortAsc = useCallback((arr: Reminder[]) => {
    return [...arr].sort((a, b) => toDate(a).getTime() - toDate(b).getTime());
  }, []);

  // -----------------------------
  // CRUD
  // -----------------------------
  const addReminder = useCallback(
    async (input: Omit<Reminder, 'id' | 'isCompleted'>) => {
      assertReminderFields(input);
      const newReminder: Reminder = {
        ...input,
        id: `rem_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
        isCompleted: false,
      };
      const notifId = await scheduleReminderNotification(newReminder);
      const nextMap = { ...notifMap, [newReminder.id]: notifId };
      const nextList = sortAsc([...reminders, newReminder]);
      setReminders(nextList);
      setNotifMap(nextMap);
      await persist(nextList, nextMap);
      return newReminder;
    },
    [notifMap, persist, reminders, sortAsc]
  );

  const updateReminder = useCallback(
    async (id: string, data: Partial<Omit<Reminder, 'id' | 'userId'>>) => {
      const idx = reminders.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Lembrete não encontrado.');
      const original = reminders[idx]!;
      const updated: Reminder = {
        ...original,
        ...data,
        title: data.title?.trim() ?? original.title,
        description: data.description?.trim() ?? original.description,
      };
      assertReminderFields({
        title: updated.title,
        date: updated.date,
        time: updated.time,
        repeat: updated.repeat,
        userId: updated.userId,
      });

      let nextMap = { ...notifMap };
      if (data.date || data.time || data.repeat) {
        await cancelNotification(nextMap[id]);
        nextMap[id] = await scheduleReminderNotification(updated);
      }

      const nextList = sortAsc(reminders.map((r) => (r.id === id ? updated : r)));
      setReminders(nextList);
      setNotifMap(nextMap);
      await persist(nextList, nextMap);
      return updated;
    },
    [notifMap, persist, reminders, sortAsc]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      const exists = reminders.some((r) => r.id === id);
      if (!exists) throw new Error('Lembrete não encontrado.');
      await cancelNotification(notifMap[id]);
      const nextList = reminders.filter((r) => r.id !== id);
      const { [id]: _, ...rest } = notifMap;
      setReminders(nextList);
      setNotifMap(rest);
      await persist(nextList, rest);
    },
    [notifMap, persist, reminders]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const target = reminders.find((r) => r.id === id);
      if (!target) throw new Error('Lembrete não encontrado.');
      let toggled: Reminder = { ...target, isCompleted: !target.isCompleted };
      let nextMap = { ...notifMap };

      if (toggled.isCompleted) {
        await cancelNotification(nextMap[id]);
        nextMap[id] = undefined;
        if (toggled.repeat && toggled.repeat !== 'none') {
          toggled.date = nextOccurrence(toggled.date, toggled.repeat);
          toggled.isCompleted = false;
          nextMap[id] = await scheduleReminderNotification(toggled);
        }
      } else {
        nextMap[id] = await scheduleReminderNotification(toggled);
      }

      const nextList = sortAsc(reminders.map((r) => (r.id === id ? toggled : r)));
      setReminders(nextList);
      setNotifMap(nextMap);
      await persist(nextList, nextMap);
      return toggled;
    },
    [notifMap, persist, reminders, sortAsc]
  );

  // -----------------------------
  // Filtros / buscas
  // -----------------------------
  const getUpcomingReminders = useCallback(() => {
    return reminders.filter((r) => !r.isCompleted && isWithinNextDays(r.date, 7));
  }, [reminders]);

  const getTodayReminders = useCallback(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return reminders.filter((r) => isSameDay(r.date, today));
  }, [reminders]);

  const searchReminders = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return reminders;
      return reminders.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q)
      );
    },
    [reminders]
  );

  const filterByCompleted = useCallback(
    (completed: boolean) => reminders.filter((r) => r.isCompleted === completed),
    [reminders]
  );

  const refreshFromStorage = useCallback(() => loadFromStorage(), [loadFromStorage]);

  const value = useMemo(
    () => ({
      reminders,
      loading,
      error,
      isInitialized,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleComplete,
      getUpcomingReminders,
      getTodayReminders,
      searchReminders,
      filterByCompleted,
      refreshFromStorage,
    }),
    [
      reminders,
      loading,
      error,
      isInitialized,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleComplete,
      getUpcomingReminders,
      getTodayReminders,
      searchReminders,
      filterByCompleted,
      refreshFromStorage,
    ]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useReminders(): ReminderContextData {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders deve ser usado dentro de RemindersProvider');
  return ctx;
}

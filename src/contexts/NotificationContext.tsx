// -------------------------------------------------------------
// src/contexts/NotificationContext.tsx
// -------------------------------------------------------------
// 💬 Controle de notificações com suporte a repetição real
// (none / daily / weekly / monthly) e proteção pra não disparar
// notificação atrasada "na hora".
// -------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { Reminder } from '@/types/models';

// -------------------------------------------------------------
// Tipagem do contexto
// -------------------------------------------------------------
interface NotificationContextType {
  permissionGranted: boolean;
  scheduled: Notifications.NotificationRequest[];
  requestPermission: () => Promise<boolean>;
  refreshScheduled: () => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  scheduleReminder: (reminder: Reminder) => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scheduled, setScheduled] = useState<Notifications.NotificationRequest[]>(
    [],
  );

  // Handler global — só configura uma vez
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  // -----------------------------------------------------------
  // Permissões
  // -----------------------------------------------------------
  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === Notifications.PermissionStatus.GRANTED;

    setPermissionGranted(granted);

    if (!granted) {
      Alert.alert(
        'Permissão negada',
        'Ative notificações nas configurações do dispositivo.',
      );
    }

    return granted;
  }, []);

  // -----------------------------------------------------------
  // Lista de notificações agendadas
  // -----------------------------------------------------------
  const refreshScheduled = useCallback(async () => {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    setScheduled(list);
  }, []);

  // -----------------------------------------------------------
  // Cancelar 1 notificação
  // -----------------------------------------------------------
  const cancelNotification = useCallback(
    async (id: string) => {
      await Notifications.cancelScheduledNotificationAsync(id);
      await refreshScheduled();
    },
    [refreshScheduled],
  );

  // -----------------------------------------------------------
  // Cancelar todas
  // -----------------------------------------------------------
  const cancelAll = useCallback(async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await refreshScheduled();
  }, [refreshScheduled]);

  // -----------------------------------------------------------
  // Agendar lembrete com repetição
  // -----------------------------------------------------------
  const scheduleReminder = useCallback(
    async (reminder: Reminder) => {
      try {
        // Garante permissão
        if (!permissionGranted) {
          const ok = await requestPermission();
          if (!ok) return null;
        }

        // Monta a data alvo em horário local
        const date = new Date(`${reminder.date}T${reminder.time}:00`);
        if (isNaN(date.getTime())) {
          console.warn('⚠️ Data inválida ao agendar lembrete:', reminder);
          return null;
        }

        const now = new Date();
        const diffSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

        let trigger: Notifications.NotificationTriggerInput | null = null;

        // 🔹 Caso 1 — Sem repetição: TIME_INTERVAL no futuro
        if (!reminder.repeat || reminder.repeat === 'none') {
          if (diffSeconds <= 0) {
            console.warn(
              '⚠️ Lembrete sem repetição em horário passado, ignorado:',
              reminder.title,
            );
            return null;
          }

          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: diffSeconds,
            repeats: false,
          };
        }

        // 🔹 Caso 2 — Diária
        else if (reminder.repeat === 'daily') {
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: date.getHours(),
            minute: date.getMinutes(),
          };
        }

        // 🔹 Caso 3 — Semanal
        else if (reminder.repeat === 'weekly') {
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: date.getDay() + 1, // domingo = 1
            hour: date.getHours(),
            minute: date.getMinutes(),
          } as any;
        }

        // 🔹 Caso 4 — Mensal (simulado a cada ~30 dias)
        else if (reminder.repeat === 'monthly') {
          trigger = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 30 * 24 * 60 * 60,
            repeats: true,
          };
        }

        if (!trigger) {
          console.warn('⚠️ Nenhum trigger válido para lembrete:', reminder.title);
          return null;
        }

        // Evita duplicar o mesmo lembrete (mesmo id) se re-agendar
        const duplicates = scheduled.filter(
          (n) => n.content.data && (n.content.data as any).reminderId === reminder.id,
        );

        for (const n of duplicates) {
          await Notifications.cancelScheduledNotificationAsync(n.identifier);
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Lembrete',
            body: reminder.title,
            sound: true,
            data: { reminderId: reminder.id },
          },
          trigger,
        });

        console.log('✅ Notificação agendada:', reminder.title, trigger);
        await refreshScheduled();

        return id;
      } catch (e) {
        console.error('Erro ao agendar notificação:', e);
        return null;
      }
    },
    [permissionGranted, requestPermission, scheduled, refreshScheduled],
  );

  // -----------------------------------------------------------
  // Boot inicial
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === Notifications.PermissionStatus.GRANTED);
      await refreshScheduled();
    })();
  }, [refreshScheduled]);

  const value = useMemo(
    () => ({
      permissionGranted,
      scheduled,
      requestPermission,
      refreshScheduled,
      cancelNotification,
      cancelAll,
      scheduleReminder,
    }),
    [
      permissionGranted,
      scheduled,
      requestPermission,
      refreshScheduled,
      cancelNotification,
      cancelAll,
      scheduleReminder,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// -------------------------------------------------------------
// Hook
// -------------------------------------------------------------
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotifications deve ser usado dentro de NotificationProvider',
    );
  }
  return ctx;
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// -----------------------------
// Tipos
// -----------------------------
export interface NotificationParams {
  title: string;
  body: string;
  date: Date;
  sound?: boolean;
  repeats?: boolean;
  channelId?: string;
}

export interface ReminderParams {
  id: string;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
}

// -----------------------------
// Configuração de canais (Android)
// -----------------------------
export async function configureNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Padrão',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Lembretes',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 200, 200, 200],
    });
  }
}

// -----------------------------
// Permissões
// -----------------------------
export async function requestPermissionsAsync(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.error('Erro ao solicitar permissão:', e);
    return false;
  }
}

export async function checkPermissionsAsync(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  } catch (e) {
    console.error('Erro ao verificar permissão:', e);
    return false;
  }
}

// -----------------------------
// Agendamento de notificações únicas
// -----------------------------
export async function scheduleNotification(
  params: NotificationParams,
): Promise<string> {
  const { title, body, date, sound = true, repeats = false, channelId = 'default' } = params;

  try {
    const trigger: Notifications.NotificationTriggerInput = Platform.select({
      ios: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats,
        dateComponents: {
          hour: dayjs(date).hour(),
          minute: dayjs(date).minute(),
        },
      },
      android: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        timestamp: date.getTime(),
        channelId,
      },
      default: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        timestamp: date.getTime(),
      },
    }) as Notifications.NotificationTriggerInput;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: sound ? 'default' : undefined,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    console.log('🔔 Notificação agendada:', id, title, date);
    return id;
  } catch (e) {
    console.error('Erro ao agendar notificação:', e);
    throw e;
  }
}

// -----------------------------
// Agendamento recorrente
// -----------------------------
export async function scheduleRecurringNotification(
  params: NotificationParams & { repeatType: 'daily' | 'weekly' | 'monthly' },
): Promise<string> {
  const { title, body, repeatType } = params;

  try {
    let trigger: Notifications.NotificationTriggerInput;

    if (repeatType === 'daily') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        repeats: true,
      };
    } else if (repeatType === 'weekly') {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 7 * 24 * 60 * 60,
        repeats: true,
      };
    } else {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30 * 24 * 60 * 60,
        repeats: true,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger,
    });

    console.log('🔁 Notificação recorrente agendada:', id, repeatType);
    return id;
  } catch (e) {
    console.error('Erro ao agendar recorrente:', e);
    throw e;
  }
}

// -----------------------------
// Cancelamento
// -----------------------------
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log('🗑️ Notificação cancelada:', id);
  } catch (e) {
    console.error('Erro ao cancelar notificação:', e);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Todas as notificações canceladas.');
  } catch (e) {
    console.error('Erro ao cancelar todas:', e);
  }
}

// -----------------------------
// Listagem
// -----------------------------
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return list;
  } catch (e) {
    console.error('Erro ao listar notificações:', e);
    return [];
  }
}

// -----------------------------
// Atualização
// -----------------------------
export async function updateNotification(
  id: string,
  params: NotificationParams,
): Promise<void> {
  try {
    await cancelNotification(id);
    await scheduleNotification(params);
  } catch (e) {
    console.error('Erro ao atualizar notificação:', e);
  }
}

// -----------------------------
// Helpers
// -----------------------------
export async function scheduleReminderNotification(reminder: ReminderParams): Promise<string> {
  const { title, description, date, time } = reminder;

  const parts = time.split(':');
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  const scheduledDate = dayjs(date).hour(h).minute(m).second(0).millisecond(0).toDate();

  return scheduleNotification({
    title: `💊 ${title}`,
    body: description || 'Lembrete de medicação',
    date: scheduledDate,
    repeats: false,
    channelId: 'reminders',
  });
}

export async function scheduleMoodReminder(): Promise<string> {
  const date = dayjs().hour(20).minute(0).second(0).toDate();
  return scheduleNotification({
    title: '🧠 Como foi seu dia?',
    body: 'Registre seu humor agora mesmo.',
    date,
    repeats: true,
    channelId: 'default',
  });
}

export async function scheduleHabitReminder(habit: { name: string; category: string }): Promise<string> {
  const date = dayjs().hour(9).minute(0).second(0).toDate();
  return scheduleNotification({
    title: `💪 ${habit.name}`,
    body: `Categoria: ${habit.category}`,
    date,
    repeats: true,
    channelId: 'default',
  });
}

// -----------------------------
// Inicialização
// -----------------------------
export async function initializeNotifications(): Promise<void> {
  await configureNotificationChannels();
  await checkPermissionsAsync();
  console.log('🔧 Sistema de notificações configurado.');
}

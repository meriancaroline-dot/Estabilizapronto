// src/services/Notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Handler de apresentação (SDK 54+ pede campos extras em iOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    // iOS (banner/list) — exigidos pelo tipo NotificationBehavior
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Garante que um canal exista no Android.
 * - use `Platform.OS === 'android'` (não existe androidNotificationBehavior)
 * - `sound` do canal deve ser string (ex.: 'default') ou undefined
 */
export async function ensureNotificationChannel(
  channelId: string,
  sound: string | null = 'default'
) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: channelId,
      importance: Notifications.AndroidImportance.HIGH,
      sound: sound ?? undefined,
      enableVibrate: true,
      vibrationPattern: [200, 100, 200],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      showBadge: true,
    });
  }
}

/**
 * Agenda uma notificação diária (repetição implícita).
 * API correta exige o campo `type` no trigger.
 */
export async function scheduleDaily(
  title: string,
  body: string,
  time: { hour: number; minute: number },
  channelId: string = 'default'
) {
  await ensureNotificationChannel(channelId, 'default');

  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: time.hour,
    minute: time.minute,
    channelId,
  };

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true, // aqui pode ser boolean
    },
    trigger,
  });
}

/**
 * Agenda para uma data/hora específica (uma única vez).
 */
export async function scheduleAt(
  title: string,
  body: string,
  date: Date,
  channelId: string = 'default'
) {
  await ensureNotificationChannel(channelId, 'default');

  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId,
  };

  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger,
  });
}

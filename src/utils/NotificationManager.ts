// src/utils/NotificationManager.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationManager {
  private static instance: NotificationManager;
  private initialized = false;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
          name: 'Lembretes',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          vibrationPattern: [0, 250, 250, 250],
        });

        await Notifications.setNotificationChannelAsync('mood', {
          name: 'Registro de Humor',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        console.warn('⚠️ Permissão de notificação negada');
      }

      this.initialized = true;
      console.log('✅ NotificationManager inicializado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.granted;
    } catch {
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async schedule(params: {
    title: string;
    body: string;
    date: Date;
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
    channelId?: string;
  }): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn('⚠️ Sem permissão para notificações');
        return null;
      }
    }

    try {
      const trigger = this.buildTrigger(params.date, params.repeat);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      console.log('🔔 Notificação agendada:', {
        id,
        title: params.title,
        date: params.date.toISOString(),
        repeat: params.repeat || 'none',
      });

      return id;
    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error);
      return null;
    }
  }

  async cancel(notificationId: string): Promise<void> {
    if (!notificationId) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('🗑️ Notificação cancelada:', notificationId);
    } catch (error) {
      console.error('❌ Erro ao cancelar notificação:', error);
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🧹 Todas as notificações canceladas');
    } catch (error) {
      console.error('❌ Erro ao cancelar todas:', error);
    }
  }

  async update(
    oldId: string,
    params: {
      title: string;
      body: string;
      date: Date;
      repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<string | null> {
    await this.cancel(oldId);
    return this.schedule(params);
  }

  async getScheduled(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Erro ao listar notificações:', error);
      return [];
    }
  }

  private buildTrigger(
    date: Date,
    repeat?: 'none' | 'daily' | 'weekly' | 'monthly'
  ): Notifications.NotificationTriggerInput {
    const now = new Date();
    const isInFuture = date.getTime() > now.getTime();

    if (!repeat || repeat === 'none') {
      const seconds = isInFuture
        ? Math.floor((date.getTime() - now.getTime()) / 1000)
        : 5;

      return {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, seconds),
        repeats: false,
      };
    }

    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: date.getHours(),
      minute: date.getMinutes(),
      repeats: true,
    };
  }
}

export const notificationManager = NotificationManager.getInstance();
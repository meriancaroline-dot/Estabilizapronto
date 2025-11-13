// src/hooks/useReminders.ts
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStorage } from './useStorage';
import { Reminder } from '@/types/models';
import { notificationManager } from '@/utils/NotificationManager'; // ✅ NOVO
import { handleError } from '@/utils/errorHandler'; // ✅ NOVO

export function useReminders() {
  const {
    value: reminders,
    setValue: setReminders,
    save: saveReminders,
    load: loadReminders,
  } = useStorage<Reminder[]>({
    key: 'reminders',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await loadReminders();
      } catch (e) {
        console.error('Erro ao carregar lembretes:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addReminder = useCallback(
    async (data: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt' | 'notificationId'>) => {
      try {
        const newReminder: Reminder = {
          ...data,
          id: uuidv4(),
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        // ✅ USA O NOTIFICATION MANAGER
        const notificationDate = new Date(`${data.date}T${data.time}`);
        const notifId = await notificationManager.schedule({
          title: '🔔 Lembrete',
          body: data.title,
          date: notificationDate,
          repeat: data.repeat || 'none',
        });

        if (notifId) {
          newReminder.notificationId = notifId;
        }

        const updated = [...reminders, newReminder];
        setReminders(updated);
        await saveReminders(updated);

        console.log('✅ Lembrete criado:', newReminder.title);
        return newReminder;
      } catch (error) {
        handleError(error, 'useReminders.addReminder');
        throw error;
      }
    },
    [reminders, setReminders, saveReminders],
  );

  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      try {
        const reminder = reminders.find(r => r.id === id);
        if (!reminder) throw new Error('Lembrete não encontrado');

        const updatedList = reminders.map(r => {
          if (r.id !== id) return r;
          return { ...r, ...updates, updatedAt: new Date().toISOString() };
        });

        setReminders(updatedList);
        await saveReminders(updatedList);

        // ✅ Atualizar notificação se data/hora mudou
        if (updates.date || updates.time) {
          const updated = updatedList.find(r => r.id === id)!;

          if (reminder.notificationId) {
            await notificationManager.cancel(reminder.notificationId);
          }

          const notificationDate = new Date(`${updated.date}T${updated.time}`);
          const notifId = await notificationManager.schedule({
            title: '🔔 Lembrete',
            body: updated.title,
            date: notificationDate,
            repeat: updated.repeat || 'none',
          });

          if (notifId) {
            updated.notificationId = notifId;
            await saveReminders(updatedList);
          }
        }

        console.log('✏️ Lembrete atualizado:', id);
        return updatedList.find(r => r.id === id)!;
      } catch (error) {
        handleError(error, 'useReminders.updateReminder');
        throw error;
      }
    },
    [reminders, setReminders, saveReminders],
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      try {
        const reminder = reminders.find(r => r.id === id);
        const filtered = reminders.filter(r => r.id !== id);

        setReminders(filtered);
        await saveReminders(filtered);

        // ✅ Cancelar notificação
        if (reminder?.notificationId) {
          await notificationManager.cancel(reminder.notificationId);
        }

        console.log('🗑️ Lembrete removido:', id);
      } catch (error) {
        handleError(error, 'useReminders.deleteReminder');
        throw error;
      }
    },
    [reminders, setReminders, saveReminders],
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      try {
        const updated = reminders.map(r =>
          r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
        );
        setReminders(updated);
        await saveReminders(updated);
      } catch (error) {
        handleError(error, 'useReminders.toggleComplete');
        throw error;
      }
    },
    [reminders, setReminders, saveReminders],
  );

  const clearReminders = useCallback(async () => {
    try {
      setReminders([]);
      await saveReminders([]);
      console.log('🧹 Lembretes limpos.');
    } catch (error) {
      handleError(error, 'useReminders.clearReminders');
      throw error;
    }
  }, [setReminders, saveReminders]);

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    clearReminders,
  };
}
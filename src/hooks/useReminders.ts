// -------------------------------------------------------------
// src/hooks/useReminders.ts
// -------------------------------------------------------------
// Gerencia lembretes + integra com NotificationContext
// (criar, editar, excluir, completar)
// -------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { useStorage } from './useStorage';
import { useNotifications } from '@/contexts/NotificationContext';
import { Reminder } from '@/types/models';

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useReminders() {
  const {
    scheduleReminder,
    cancelNotification,
    refreshScheduled,
  } = useNotifications();

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

  // -----------------------------------------------------------
  // Carregar lembretes na inicialização
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        await loadReminders();
        await refreshScheduled();
      } catch (e) {
        console.error('Erro ao carregar lembretes:', e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------
  // Adicionar lembrete
  // -----------------------------------------------------------
  const addReminder = useCallback(
    async (
      data: Omit<
        Reminder,
        'id' | 'isCompleted' | 'createdAt' | 'updatedAt' | 'notificationId'
      >,
    ) => {
      try {
        const nowIso = new Date().toISOString();

        const newReminder: Reminder = {
          ...data,
          id: uuidv4(),
          isCompleted: false,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        const listAfterAdd = [...reminders, newReminder];
        setReminders(listAfterAdd);
        await saveReminders(listAfterAdd);

        // agenda notificação
        const notifId = await scheduleReminder(newReminder);
        if (notifId) {
          const listWithNotif = listAfterAdd.map((r) =>
            r.id === newReminder.id ? { ...r, notificationId: notifId } : r,
          );
          setReminders(listWithNotif);
          await saveReminders(listWithNotif);
        }

        console.log('✅ Lembrete criado:', newReminder.title);
      } catch (e) {
        console.error('Erro ao adicionar lembrete:', e);
        Alert.alert('Erro', 'Não foi possível criar o lembrete.');
      }
    },
    [reminders, saveReminders, scheduleReminder, setReminders],
  );

  // -----------------------------------------------------------
  // Atualizar lembrete
  // -----------------------------------------------------------
  const updateReminder = useCallback(
    async (id: string, updates: Partial<Reminder>) => {
      try {
        const current = reminders.find((r) => r.id === id);
        if (!current) return;

        // se tinha notificação anterior, cancela
        if (current.notificationId) {
          await cancelNotification(current.notificationId);
        }

        const merged: Reminder = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        // re-agenda notificação
        const notifId = await scheduleReminder(merged);
        const withNotif: Reminder = {
          ...merged,
          notificationId: notifId ?? undefined,
        };

        const updatedList = reminders.map((r) => (r.id === id ? withNotif : r));
        setReminders(updatedList);
        await saveReminders(updatedList);

        console.log('✏️ Lembrete atualizado:', id);
      } catch (e) {
        console.error('Erro ao atualizar lembrete:', e);
        Alert.alert('Erro', 'Não foi possível atualizar o lembrete.');
      }
    },
    [reminders, cancelNotification, scheduleReminder, saveReminders, setReminders],
  );

  // -----------------------------------------------------------
  // Remover lembrete
  // -----------------------------------------------------------
  const deleteReminder = useCallback(
    async (id: string) => {
      try {
        const target = reminders.find((r) => r.id === id);

        const filtered = reminders.filter((r) => r.id !== id);
        setReminders(filtered);
        await saveReminders(filtered);

        if (target?.notificationId) {
          await cancelNotification(target.notificationId);
        }

        console.log('🗑️ Lembrete removido:', id);
      } catch (e) {
        console.error('Erro ao remover lembrete:', e);
        Alert.alert('Erro', 'Não foi possível remover o lembrete.');
      }
    },
    [reminders, saveReminders, setReminders, cancelNotification],
  );

  // -----------------------------------------------------------
  // Alternar conclusão
  // -----------------------------------------------------------
  const toggleComplete = useCallback(
    async (id: string) => {
      try {
        const updated = reminders.map((r) =>
          r.id === id ? { ...r, isCompleted: !r.isCompleted } : r,
        );
        setReminders(updated);
        await saveReminders(updated);
      } catch (e) {
        console.error('Erro ao alternar lembrete:', e);
      }
    },
    [reminders, saveReminders, setReminders],
  );

  // -----------------------------------------------------------
  // Limpar todos
  // -----------------------------------------------------------
  const clearReminders = useCallback(async () => {
    try {
      setReminders([]);
      await saveReminders([]);
      console.log('🧹 Lembretes limpos.');
    } catch (e) {
      console.error('Erro ao limpar lembretes:', e);
    }
  }, [saveReminders, setReminders]);

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

// src/hooks/useTasks.ts
import { useCallback, useEffect, useState } from 'react';
import { useStorage } from './useStorage';
import { Task } from '@/types/models';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------------
// Hook principal — Gerencia tarefas do usuário
// -------------------------------------------------------------
export function useTasks() {
  const {
    value: tasks,
    setValue: setTasks,
    save: saveTasks,
    load: loadTasks,
  } = useStorage<Task[]>({
    key: 'tasks',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar tarefas (roda só uma vez)
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        await loadTasks();
      } catch (e) {
        console.error('Erro ao carregar tarefas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // ← sem dependências, evita loop infinito

  // -----------------------------------------------------------
  // Criar tarefa
  // -----------------------------------------------------------
  const addTask = useCallback(
    async (data: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
      try {
        const newTask: Task = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          completed: false,
        };

        const updated = [...tasks, newTask];
        setTasks(updated);
        await saveTasks(updated);
        console.log('✅ Tarefa criada:', newTask.title);
      } catch (e) {
        console.error('Erro ao criar tarefa:', e);
        Alert.alert('Erro', 'Não foi possível criar a tarefa.');
      }
    },
    [tasks, setTasks, saveTasks]
  );

  // -----------------------------------------------------------
  // Atualizar tarefa
  // -----------------------------------------------------------
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      try {
        const updatedList = tasks.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        );
        setTasks(updatedList);
        await saveTasks(updatedList);
        console.log('✏️ Tarefa atualizada:', id);
      } catch (e) {
        console.error('Erro ao atualizar tarefa:', e);
        Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
      }
    },
    [tasks, setTasks, saveTasks]
  );

  // -----------------------------------------------------------
  // Excluir tarefa
  // -----------------------------------------------------------
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        const filtered = tasks.filter((t) => t.id !== id);
        setTasks(filtered);
        await saveTasks(filtered);
        console.log('🗑️ Tarefa removida:', id);
      } catch (e) {
        console.error('Erro ao remover tarefa:', e);
        Alert.alert('Erro', 'Não foi possível remover a tarefa.');
      }
    },
    [tasks, setTasks, saveTasks]
  );

  // -----------------------------------------------------------
  // Alternar conclusão (completa ↔ pendente)
  // -----------------------------------------------------------
  const toggleCompletion = useCallback(
    async (id: string) => {
      try {
        const updatedList = tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
        );
        setTasks(updatedList);
        await saveTasks(updatedList);
        console.log('🔁 Status da tarefa alternado:', id);
      } catch (e) {
        console.error('Erro ao alternar status da tarefa:', e);
        Alert.alert('Erro', 'Não foi possível atualizar o status.');
      }
    },
    [tasks, setTasks, saveTasks]
  );

  // -----------------------------------------------------------
  // Limpar todas as tarefas
  // -----------------------------------------------------------
  const clearTasks = useCallback(async () => {
    try {
      setTasks([]);
      await saveTasks([]);
      console.log('🧹 Todas as tarefas foram removidas.');
    } catch (e) {
      console.error('Erro ao limpar tarefas:', e);
      Alert.alert('Erro', 'Não foi possível limpar as tarefas.');
    }
  }, [setTasks, saveTasks]);

  // -----------------------------------------------------------
  // Estatísticas rápidas
  // -----------------------------------------------------------
  const getCompletedCount = useCallback(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );

  const getPendingCount = useCallback(
    () => tasks.filter((t) => !t.completed).length,
    [tasks]
  );

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    clearTasks,
    getCompletedCount,
    getPendingCount,
  };
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { gamification } from '@/gamification/GamificationEngine';

// -----------------------------
// Tipos
// -----------------------------
export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  completedDates: string[]; // ISO strings YYYY-MM-DD
  userId: string;
}

interface HabitsContextData {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => Promise<Habit>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (id: string, date?: string) => Promise<Habit>;
  getHabitsForToday: () => Habit[];
  getHabitProgress: (id: string) => number; // porcentagem de conclusão
  refreshFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@estabiliza:habits';
const HabitsContext = createContext<HabitsContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const HabitsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  const persist = useCallback(async (data: Habit[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar hábitos:', e);
      setError('Falha ao salvar hábitos.');
    }
  }, []);

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Habit[] = raw ? JSON.parse(raw) : [];
      parsed.sort((a, b) => a.name.localeCompare(b.name));
      setHabits(parsed);
    } catch (e) {
      console.error('Erro ao carregar hábitos:', e);
      setError('Falha ao carregar hábitos.');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    dayjs.locale('pt-br');
    loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------
  // CRUD
  // -----------------------------
  const addHabit = useCallback(
    async (habit: Omit<Habit, 'id' | 'streak' | 'completedDates'>) => {
      try {
        if (!habit.name.trim()) throw new Error('Nome do hábito é obrigatório.');

        const newHabit: Habit = {
          ...habit,
          id: `hab_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
          streak: 0,
          completedDates: [],
        };

        const updated = [...habits, newHabit];
        setHabits(updated);
        await persist(updated);
        return newHabit;
      } catch (e) {
        console.error('Erro ao adicionar hábito:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao adicionar hábito.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [habits, persist],
  );

  const updateHabit = useCallback(
    async (id: string, data: Partial<Habit>) => {
      try {
        const idx = habits.findIndex((h) => h.id === id);
        if (idx === -1) throw new Error('Hábito não encontrado.');
        const updatedHabit: Habit = { ...habits[idx]!, ...data };
        const updatedList = habits.map((h) => (h.id === id ? updatedHabit : h));
        setHabits(updatedList);
        await persist(updatedList);
        return updatedHabit;
      } catch (e) {
        console.error('Erro ao atualizar hábito:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao atualizar hábito.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [habits, persist],
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      try {
        const exists = habits.some((h) => h.id === id);
        if (!exists) throw new Error('Hábito não encontrado.');
        const filtered = habits.filter((h) => h.id !== id);
        setHabits(filtered);
        await persist(filtered);
      } catch (e) {
        console.error('Erro ao deletar hábito:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao deletar hábito.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [habits, persist],
  );

  // -----------------------------
  // Lógica de streaks e conclusão
  // -----------------------------
  const toggleHabitCompletion = useCallback(
    async (id: string, date?: string) => {
      try {
        const today = date || dayjs().format('YYYY-MM-DD');
        const idx = habits.findIndex((h) => h.id === id);
        if (idx === -1) throw new Error('Hábito não encontrado.');

        const target = habits[idx]!;
        const completed = target.completedDates.includes(today);

        let updated: Habit;
        if (completed) {
          updated = {
            ...target,
            completedDates: target.completedDates.filter((d) => d !== today),
          };
        } else {
          const updatedDates = [...target.completedDates, today];
          updatedDates.sort((a, b) => a.localeCompare(b));

          let streak = 0;
          let current = dayjs(today);
          while (updatedDates.includes(current.format('YYYY-MM-DD'))) {
            streak++;
            current = current.subtract(1, 'day');
          }

          updated = { ...target, completedDates: updatedDates, streak };

          gamification.registerEvent('habit_complete');
        }

        const updatedList = habits.map((h) => (h.id === id ? updated : h));
        setHabits(updatedList);
        await persist(updatedList);
        return updated;
      } catch (e) {
        console.error('Erro ao marcar hábito:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao marcar hábito.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [habits, persist],
  );

  // -----------------------------
  // Consultas
  // -----------------------------
  const getHabitsForToday = useCallback(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return habits.filter((h) => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekly') return dayjs(today).day() === 1;
      if (h.frequency === 'monthly') return dayjs(today).date() === 1;
      return false;
    });
  }, [habits]);

  const getHabitProgress = useCallback(
    (id: string): number => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return 0;
      const totalDays = habit.completedDates.length;
      if (totalDays === 0) return 0;
      return Math.min((habit.streak / totalDays) * 100, 100);
    },
    [habits],
  );

  const refreshFromStorage = useCallback(async () => {
    await loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------
  // Valor exportado
  // -----------------------------
  const value = useMemo<HabitsContextData>(
    () => ({
      habits,
      loading,
      error,
      isInitialized,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitCompletion,
      getHabitsForToday,
      getHabitProgress,
      refreshFromStorage,
    }),
    [
      habits,
      loading,
      error,
      isInitialized,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitCompletion,
      getHabitsForToday,
      getHabitProgress,
      refreshFromStorage,
    ],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useHabits(): HabitsContextData {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits deve ser usado dentro de HabitsProvider');
  return ctx;
}

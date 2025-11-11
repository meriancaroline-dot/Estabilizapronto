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

// -----------------------------
// Tipos
// -----------------------------
export interface MoodEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5; // escala 1 (péssimo) a 5 (ótimo)
  note?: string;
  activities: string[];
  date: string; // formato ISO YYYY-MM-DD
  userId: string;
}

interface MoodContextData {
  moods: MoodEntry[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  addMood: (entry: Omit<MoodEntry, 'id'>) => Promise<MoodEntry>;
  updateMood: (id: string, data: Partial<MoodEntry>) => Promise<MoodEntry>;
  deleteMood: (id: string) => Promise<void>;
  getMoodByDate: (date: string) => MoodEntry | undefined;
  getAverageMood: (days?: number) => number;
  getRecentMoods: (days: number) => MoodEntry[];
  searchMoods: (query: string) => MoodEntry[];
  refreshFromStorage: () => Promise<void>;
}

const STORAGE_KEY = '@estabiliza:moods';
const MoodContext = createContext<MoodContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const MoodProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  const persist = useCallback(async (data: MoodEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar moods:', e);
      setError('Falha ao salvar dados de humor.');
    }
  }, []);

  const loadFromStorage = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: MoodEntry[] = raw ? JSON.parse(raw) : [];
      parsed.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
      setMoods(parsed);
    } catch (e) {
      console.error('Erro ao carregar moods:', e);
      setError('Falha ao carregar dados de humor.');
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
  const addMood = useCallback(
    async (entry: Omit<MoodEntry, 'id'>) => {
      try {
        if (entry.mood < 1 || entry.mood > 5)
          throw new Error('Valor de humor deve estar entre 1 e 5.');

        const newEntry: MoodEntry = {
          ...entry,
          id: `mood_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
        };

        const updated = [newEntry, ...moods];
        setMoods(updated);
        await persist(updated);
        return newEntry;
      } catch (e) {
        console.error('Erro ao adicionar mood:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao adicionar registro.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [moods, persist],
  );

  const updateMood = useCallback(
    async (id: string, data: Partial<MoodEntry>) => {
      try {
        const idx = moods.findIndex((m) => m.id === id);
        if (idx === -1) throw new Error('Registro não encontrado.');

        const updatedEntry: MoodEntry = { ...moods[idx]!, ...data };
        const updatedList = moods.map((m) => (m.id === id ? updatedEntry : m));
        setMoods(updatedList);
        await persist(updatedList);
        return updatedEntry;
      } catch (e) {
        console.error('Erro ao atualizar mood:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao atualizar registro.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [moods, persist],
  );

  const deleteMood = useCallback(
    async (id: string) => {
      try {
        const exists = moods.some((m) => m.id === id);
        if (!exists) throw new Error('Registro não encontrado.');
        const filtered = moods.filter((m) => m.id !== id);
        setMoods(filtered);
        await persist(filtered);
      } catch (e) {
        console.error('Erro ao deletar mood:', e);
        const msg = e instanceof Error ? e.message : 'Falha ao deletar registro.';
        setError(msg);
        throw new Error(msg);
      }
    },
    [moods, persist],
  );

  // -----------------------------
  // Consultas
  // -----------------------------
  const getMoodByDate = useCallback(
    (date: string): MoodEntry | undefined => moods.find((m) => m.date === date),
    [moods],
  );

  const getRecentMoods = useCallback(
    (days: number) => {
      const start = dayjs().subtract(days, 'day');
      return moods.filter((m) => dayjs(m.date).isAfter(start));
    },
    [moods],
  );

  const getAverageMood = useCallback(
    (days?: number) => {
      const list = days ? getRecentMoods(days) : moods;
      if (list.length === 0) return 0;
      const total = list.reduce((acc, m) => acc + m.mood, 0);
      return parseFloat((total / list.length).toFixed(2));
    },
    [moods, getRecentMoods],
  );

  const searchMoods = useCallback(
    (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return moods;
      return moods.filter(
        (m) =>
          m.note?.toLowerCase().includes(q) ||
          m.activities.some((a) => a.toLowerCase().includes(q)),
      );
    },
    [moods],
  );

  const refreshFromStorage = useCallback(async () => {
    await loadFromStorage();
  }, [loadFromStorage]);

  // -----------------------------
  // Valor exportado
  // -----------------------------
  const value = useMemo<MoodContextData>(
    () => ({
      moods,
      loading,
      error,
      isInitialized,
      addMood,
      updateMood,
      deleteMood,
      getMoodByDate,
      getAverageMood,
      getRecentMoods,
      searchMoods,
      refreshFromStorage,
    }),
    [
      moods,
      loading,
      error,
      isInitialized,
      addMood,
      updateMood,
      deleteMood,
      getMoodByDate,
      getAverageMood,
      getRecentMoods,
      searchMoods,
      refreshFromStorage,
    ],
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

// -----------------------------
// Hook
// -----------------------------
export function useMood(): MoodContextData {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood deve ser usado dentro de MoodProvider');
  return ctx;
}

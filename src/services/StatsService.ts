// -------------------------------------------------------------
// src/services/StatsService.ts
// Serviço para cálculos de estatísticas do Estabiliza
// -------------------------------------------------------------

import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface MoodEntry {
  id: string;
  mood: number; // 1-5
  note?: string;
  activities?: string[];
  date: string; // ISO
  userId: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  streak: number;
  completedDates: string[];
  userId: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  isCompleted: boolean;
  userId: string;
}

export interface StatsResult {
  currentStreak: number;
  longestStreak: number;
  moodAverage: number;
  habitsCompletedToday: number;
  totalHabits: number;
  medicationOnTimeRate: number;
}

// -------------------------------------------------------------
// Funções auxiliares
// -------------------------------------------------------------

/**
 * Calcula o streak atual e o mais longo baseado em datas completadas.
 */
export function calculateStreaks(completedDates: string[]): {
  current: number;
  longest: number;
} {
  if (!completedDates.length) return { current: 0, longest: 0 };

  const sorted = [...completedDates].sort((a, b) =>
    dayjs(a).isAfter(b) ? 1 : -1,
  );

  let current = 1;
  let longest = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = dayjs(sorted[i - 1]);
    const curr = dayjs(sorted[i]);
    if (curr.diff(prev, 'day') === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  // Se o último dia for hoje, mantém streak atual
  const lastDate = dayjs(sorted[sorted.length - 1]);
  if (!lastDate.isSame(dayjs(), 'day') && lastDate.isBefore(dayjs(), 'day')) {
    current = 0;
  }

  return { current, longest };
}

/**
 * Calcula a média de humor (1-5).
 */
export function calculateMoodAverage(entries: MoodEntry[]): number {
  if (!entries.length) return 0;
  const total = entries.reduce((acc, e) => acc + e.mood, 0);
  return parseFloat((total / entries.length).toFixed(2));
}

/**
 * Calcula o percentual de medicações tomadas no prazo.
 */
export function calculateMedicationRate(reminders: Reminder[]): number {
  if (!reminders.length) return 0;
  const completed = reminders.filter((r) => r.isCompleted).length;
  return parseFloat(((completed / reminders.length) * 100).toFixed(1));
}

/**
 * Conta hábitos completados hoje.
 */
export function countHabitsCompletedToday(habits: Habit[]): number {
  const today = dayjs().format('YYYY-MM-DD');
  return habits.filter((h) => h.completedDates.includes(today)).length;
}

/**
 * Gera um resumo completo de estatísticas.
 */
export function generateStats(
  habits: Habit[],
  moods: MoodEntry[],
  reminders: Reminder[],
): StatsResult {
  const allDates = habits.flatMap((h) => h.completedDates);
  const streak = calculateStreaks(allDates);
  const avgMood = calculateMoodAverage(moods);
  const completedToday = countHabitsCompletedToday(habits);
  const totalHabits = habits.length;
  const medRate = calculateMedicationRate(reminders);

  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    moodAverage: avgMood,
    habitsCompletedToday: completedToday,
    totalHabits,
    medicationOnTimeRate: medRate,
  };
}

/**
 * Retorna os últimos N dias de humor (para gráficos).
 */
export function getRecentMoodTrend(
  moods: MoodEntry[],
  days = 7,
): { date: string; mood: number }[] {
  const end = dayjs();
  const start = end.subtract(days - 1, 'day');
  const range: { date: string; mood: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = start.add(i, 'day');
    const entry = moods.find((m) => dayjs(m.date).isSame(date, 'day'));
    range.push({
      date: date.format('YYYY-MM-DD'),
      mood: entry ? entry.mood : 0,
    });
  }

  return range;
}

// -------------------------------------------------------------
// Exporta tudo organizado
// -------------------------------------------------------------
export const StatsService = {
  calculateStreaks,
  calculateMoodAverage,
  calculateMedicationRate,
  countHabitsCompletedToday,
  generateStats,
  getRecentMoodTrend,
};

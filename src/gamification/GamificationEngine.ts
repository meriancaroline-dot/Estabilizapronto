import AsyncStorage from "@react-native-async-storage/async-storage";
import { missions } from "./MissionsEngine";

// ---------------------------------------------
// EVENTOS QUE O APP DISPARA
// ---------------------------------------------
export type GamifiedEventType =
  | "mood_log"
  | "habit_complete"
  | "note_created"
  | "reminder_done";

// ---------------------------------------------
// ESTATÍSTICAS QUE CONTROLAM MISSÕES E CONQUISTAS
// ---------------------------------------------
export interface GamificationStats {
  moodCount: number;
  moodStreak: number;
  lastMoodDate?: string;
  habitsCompleted: number;
  notesCreated: number;
  remindersCompleted: number;
}

const XP_KEY = "@estabiliza:xp";
const STATS_KEY = "@estabiliza:gamificationStats";

const DEFAULT_STATS: GamificationStats = {
  moodCount: 0,
  moodStreak: 0,
  lastMoodDate: undefined,
  habitsCompleted: 0,
  notesCreated: 0,
  remindersCompleted: 0,
};

// ---------------------------------------------
// ENGINE PRINCIPAL
// ---------------------------------------------
export class GamificationEngine {
  xp: number = 0;
  stats: GamificationStats = DEFAULT_STATS;

  async init() {
    const xpStored = await AsyncStorage.getItem(XP_KEY);
    const statsStored = await AsyncStorage.getItem(STATS_KEY);

    this.xp = xpStored ? Number(xpStored) : 0;
    this.stats = statsStored ? JSON.parse(statsStored) : DEFAULT_STATS;
  }

  async addXP(amount: number) {
    this.xp += amount;
    await AsyncStorage.setItem(XP_KEY, String(this.xp));
  }

  // ---------------------------------------------
  // REGISTRAR EVENTOS DE USO (HUMOR, HÁBITO ETC)
  // ---------------------------------------------
  async registerEvent(type: GamifiedEventType) {
    const now = new Date();
    const today = now.toDateString();
    const newStats: GamificationStats = { ...this.stats };

    // HUMOR
    if (type === "mood_log") {
      const prev = newStats.lastMoodDate
        ? new Date(newStats.lastMoodDate).toDateString()
        : null;

      if (!prev) {
        newStats.moodStreak = 1;
      } else if (prev !== today) {
        const diff =
          (new Date(today).getTime() - new Date(prev).getTime()) /
          (1000 * 60 * 60 * 24);

        newStats.moodStreak = diff === 1 ? newStats.moodStreak + 1 : 1;
      }

      newStats.moodCount++;
      newStats.lastMoodDate = now.toISOString();
    }

    // HÁBITOS
    if (type === "habit_complete") newStats.habitsCompleted++;

    // NOTAS
    if (type === "note_created") newStats.notesCreated++;

    // LEMBRETES
    if (type === "reminder_done") newStats.remindersCompleted++;

    // PERSISTE STATS
    this.stats = newStats;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));

    // ATUALIZA MISSÕES BASEADAS NAS NOVAS STATS
    await missions.updateFromStats(newStats);

    // ✔ Conquistas são tratadas no hook AchievementTriggers
  }
}

export const gamification = new GamificationEngine();

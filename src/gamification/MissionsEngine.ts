// -------------------------------------------------------------
// src/gamification/MissionsEngine.ts
// Sistema original de Missões
// -------------------------------------------------------------
import AsyncStorage from "@react-native-async-storage/async-storage";

// -------------------------------------------------------------------
// TIPOS COMPATÍVEIS COM GamificationEngine (não importar pra evitar loop)
// -------------------------------------------------------------------
export interface GamificationStats {
  moodCount: number;
  moodStreak: number;
  habitsCompleted: number;
  notesCreated: number;
  remindersCompleted: number;
  lastMoodDate?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number; // meta numérica (ex: 5 hábitos)
  progress: number; // 0 a 100 (%)
  statKey: keyof GamificationStats; // qual stat controla essa missão
  rewardXP?: number; // recompensa em XP
  completedAt?: string;
}

const STORAGE_KEY = "@estabiliza:missions";

// -------------------------------------------------------------------
// CONFIGURAÇÃO "INFINITA" DE MARCOS (progressão longa)
// -------------------------------------------------------------------
const HABIT_MILESTONES = [5, 10, 20, 40, 60, 80, 100, 150, 200, 300, 500];
const MOOD_COUNT_MILESTONES = [3, 7, 15, 30, 60, 120, 240, 480];
const MOOD_STREAK_MILESTONES = [3, 7, 14, 21, 30, 45, 60];
const NOTES_MILESTONES = [3, 5, 10, 20, 50, 100, 200];
const REMINDERS_MILESTONES = [1, 5, 10, 20, 40, 80, 160];

function habitTitle(target: number) {
  if (target <= 5) return "Primeiros passos em hábitos";
  if (target <= 20) return "Ritual de disciplina";
  if (target <= 60) return "Constância em construção";
  if (target <= 150) return "Mestra dos hábitos";
  return "Lenda dos hábitos";
}

function moodCountTitle(target: number) {
  if (target <= 3) return "Primeiros registros de humor";
  if (target <= 15) return "Cartógrafa do humor";
  if (target <= 60) return "Guardião das emoções";
  return "Cronista das marés internas";
}

function moodStreakTitle(target: number) {
  if (target <= 3) return "Mini sequência de humor";
  if (target <= 7) return "Semana de presença";
  if (target <= 21) return "Ritual de constância";
  return "Guardiã da rotina emocional";
}

function notesTitle(target: number) {
  if (target <= 3) return "Primeiras notas";
  if (target <= 10) return "Caderno vivo";
  if (target <= 50) return "Arquivo da alma";
  return "Biblioteca interior";
}

function remindersTitle(target: number) {
  if (target <= 1) return "Primeiro lembrete concluído";
  if (target <= 10) return "Cuidadora do tempo";
  if (target <= 40) return "Agenda consciente";
  return "Arquitetando o próprio ritmo";
}

function xpForTarget(target: number): number {
  if (target <= 5) return 20;
  if (target <= 10) return 30;
  if (target <= 20) return 40;
  if (target <= 50) return 60;
  if (target <= 100) return 80;
  if (target <= 200) return 120;
  return 200;
}

// -------------------------------------------------------------------
// ENGINE
// -------------------------------------------------------------------
export class MissionsEngine {
  missions: Mission[] = [];

  private buildConfigMissions(): Mission[] {
    const list: Mission[] = [];

    HABIT_MILESTONES.forEach((target) => {
      list.push({
        id: `habit_total_${target}`,
        title: habitTitle(target),
        description: `Complete ${target} hábitos no total.`,
        target,
        progress: 0,
        statKey: "habitsCompleted",
        rewardXP: xpForTarget(target),
      });
    });

    MOOD_COUNT_MILESTONES.forEach((target) => {
      list.push({
        id: `mood_count_${target}`,
        title: moodCountTitle(target),
        description: `Registre seu humor ${target} vezes.`,
        target,
        progress: 0,
        statKey: "moodCount",
        rewardXP: xpForTarget(target),
      });
    });

    MOOD_STREAK_MILESTONES.forEach((target) => {
      list.push({
        id: `mood_streak_${target}`,
        title: moodStreakTitle(target),
        description: `Mantenha uma sequência de ${target} dias registrando seu humor.`,
        target,
        progress: 0,
        statKey: "moodStreak",
        rewardXP: xpForTarget(target),
      });
    });

    NOTES_MILESTONES.forEach((target) => {
      list.push({
        id: `notes_created_${target}`,
        title: notesTitle(target),
        description: `Crie ${target} notas.`,
        target,
        progress: 0,
        statKey: "notesCreated",
        rewardXP: xpForTarget(target),
      });
    });

    REMINDERS_MILESTONES.forEach((target) => {
      list.push({
        id: `reminders_done_${target}`,
        title: remindersTitle(target),
        description: `Conclua ${target} lembretes.`,
        target,
        progress: 0,
        statKey: "remindersCompleted",
        rewardXP: xpForTarget(target),
      });
    });

    return list;
  }

  private mergeWithConfig(saved: Mission[]): Mission[] {
    const base = this.buildConfigMissions();
    const savedMap = new Map<string, Mission>();
    saved.forEach((m) => savedMap.set(m.id, m));

    return base.map((baseMission) => {
      const existing = savedMap.get(baseMission.id);
      if (!existing) return baseMission;

      return {
        ...baseMission,
        progress: existing.progress ?? 0,
        completedAt: existing.completedAt,
      };
    });
  }

  async init() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed: Mission[] = JSON.parse(raw);
        this.missions = this.mergeWithConfig(parsed);
      } catch (e) {
        console.warn("Falha ao ler missões, recriando catálogo:", e);
        this.missions = this.buildConfigMissions();
      }
    } else {
      this.missions = this.buildConfigMissions();
    }

    await this.persist();
  }

  async persist() {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.missions));
  }

  async updateFromStats(stats: GamificationStats) {
    let changed = false;

    for (const m of this.missions) {
      const statValue = Number(stats[m.statKey] ?? 0);
      const newProgress = Math.min(
        100,
        m.target > 0 ? Math.round((statValue / m.target) * 100) : 0
      );

      if (newProgress !== m.progress) {
        m.progress = newProgress;
        changed = true;
      }

      if (newProgress >= 100 && !m.completedAt) {
        m.completedAt = new Date().toISOString();
        changed = true;
      }
    }

    if (changed) {
      await this.persist();
    }
  }

  getActiveMissions() {
    return this.missions
      .filter((m) => !m.completedAt)
      .sort((a, b) => a.target - b.target)
      .slice(0, 10);
  }

  getCompletedMissions() {
    return this.missions
      .filter((m) => !!m.completedAt)
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return (
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
        );
      });
  }
}

export const missions = new MissionsEngine();

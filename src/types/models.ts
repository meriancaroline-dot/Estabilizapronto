// -------------------------------------------------------------
// Tipos globais usados no Estabiliza
// -------------------------------------------------------------

// -------------------------------------------------------------
// Ajustes de compatibilidade entre contexts e hooks
// -------------------------------------------------------------

// 🎨 Modo de tema
export type ThemeMode = "light" | "dark" | "system";

// -------------------------------------------------------------
// 🧭 Estatísticas gerais do app
// -------------------------------------------------------------
export interface AppStats {
  totalReminders: number;
  completedReminders: number;
  totalHabits: number;
  activeHabits: number;
  totalTasks: number;
  completedTasks: number;
  moodAverage: number;
  streakLongest: number;
  generatedAt: string;
}

// -------------------------------------------------------------
// 🧠 Tipo de lembrete
// -------------------------------------------------------------
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // hh:mm
  repeat?: "none" | "daily" | "weekly" | "monthly";
  isCompleted: boolean;
  notificationId?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// ✅ Tarefas
// -------------------------------------------------------------
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: string;
  tags?: string[];
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 🌿 Hábitos
// -------------------------------------------------------------
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  streak?: number;
  lastCompleted?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 😌 Humor
// -------------------------------------------------------------
export interface Mood {
  id: string;
  rating: number; // 1 a 5
  label: string;
  emoji: string;
  weather?: string;
  season?: string;
  note?: string;
  date: string;
  period?: "morning" | "afternoon" | "night";
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 🏅 Conquista
// -------------------------------------------------------------
export interface Achievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  dateAchieved?: string;
}

// -------------------------------------------------------------
// 📝 Nota
// -------------------------------------------------------------
export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// 👤 Usuário e preferências
// -------------------------------------------------------------
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;

  // ⭐ ADICIONADO (sem alterar nada existente)
  gender?: "female" | "male" | "non_binary" | "other" | "prefer_not_to_say";
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  preferences?: UserPreferences;

  createdAt: string;
  updatedAt?: string;
}

// Alias para compatibilidade
export type User = AppUser;

// -------------------------------------------------------------
// ⚙️ Preferências e Configurações
// -------------------------------------------------------------
export interface UserPreferences {
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
}

export interface AppSettings {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  backupEnabled: boolean;
  syncEnabled: boolean;
  language: string;
  updatedAt: string;
  dailyReminderTime?: string;
  lastCloudSync?: string;
}

// -------------------------------------------------------------
// 📦 Estrutura completa de backup/exportação
// -------------------------------------------------------------
export interface ExportData {
  reminders: Reminder[];
  moods: Mood[];
  habits: Habit[];
  achievements: Achievement[];
  tasks: Task[];
  notes: Note[];
  settings: AppSettings;
  stats?: AppStats;
  user?: AppUser;
  exportedAt: string;
}

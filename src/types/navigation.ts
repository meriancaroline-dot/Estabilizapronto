// src/types/navigation.ts
// -------------------------------------------------------------
// Tipagem da navegação principal (React Navigation)
// -------------------------------------------------------------

import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Home: undefined;
  Reminders: undefined;
  Mood: undefined;
  Habits: undefined;
  Support: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  ReminderDetails: { id: string };
  MoodEntryDetails: { id: string };
  HabitDetails: { id: string };
};

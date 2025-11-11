// -------------------------------------------------------------
// Tipagem das rotas do app (Stack + Tabs + Substacks)
// -------------------------------------------------------------
// ⚠️ Padrão oficial: nomes internos em inglês, títulos exibidos em português
// -------------------------------------------------------------

// 👇 Abas inferiores
export type RootTabParamList = {
  Dashboard: undefined;       // Tela inicial
  Mood: undefined;            // Registro de humor
  Reminders: undefined;       // Lembretes
  Habits: undefined;          // Hábitos
  Notes: undefined;           // Notas pessoais
  Stats: undefined;           // Estatísticas gerais
  Professionals: undefined;   // Profissionais + Espaço de escuta
  Profile: undefined;         // Perfil do usuário
  Config?: undefined;         // (futura aba de configurações, opcional)
};

// 👇 Stack principal (AppNavigator)
export type RootStackParamList = {
  Tabs: undefined;

  // Telas extras fora das Tabs
  Details?: { id: string };
  ReminderDetails?: { id: string };
  TaskDetails?: { id: string };
  HabitDetails?: { id: string };
  NoteDetails?: { id: string };

  // Fluxos futuros
  Onboarding?: undefined;

  // 🧩 Telas de autenticação
  Login?: undefined;
  Register?: undefined;
  ForgotPassword?: undefined; // ✅ Tela de recuperação de senha
};

// -------------------------------------------------------------
// 🧭 Stacks secundários
// -------------------------------------------------------------

// ⚙️ Stack de Configurações
export type SettingsStackParamList = {
  SettingsHome: undefined;
  Notifications: undefined;
  Appearance: undefined;
  Privacy: undefined;
};

// 👤 Stack de Perfil
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Achievements: undefined; // Conquistas dentro do perfil
  Settings: undefined; // ✅ Nova tela de Configurações dentro do Perfil
};

// -------------------------------------------------------------
// 📲 Tipos utilitários pra navegação
// -------------------------------------------------------------

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";

// Tabs
export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

// Stack principal
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Substacks (Profile / Settings)
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

// Composto (pra telas dentro de tabs que também navegam entre stacks)
export type CompositeRootScreenProps<
  T extends keyof RootTabParamList
> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

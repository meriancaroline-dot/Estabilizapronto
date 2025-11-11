// -------------------------------------------------------------
// src/navigation/SettingsNavigator.tsx
// -------------------------------------------------------------
// Stack interno para telas de Configurações
// -------------------------------------------------------------

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { SettingsStackParamList } from "./types";

// 🧱 Telas já existentes no projeto
import SettingsScreen from "@/screens/SettingsScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import AppearanceScreen from "@/screens/AppearanceScreen";
import PrivacyScreen from "@/screens/PrivacyScreen";

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        animation: "slide_from_right",
      }}
    >
      {/* Tela inicial de configurações */}
      <Stack.Screen
        name="SettingsHome"
        component={SettingsScreen}
        options={{ title: "Configurações" }}
      />

      {/* Notificações */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notificações" }}
      />

      {/* Aparência */}
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{ title: "Aparência" }}
      />

      {/* Privacidade */}
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: "Privacidade" }}
      />
    </Stack.Navigator>
  );
}

// -------------------------------------------------------------
// src/navigation/ProfileNavigator.tsx
// -------------------------------------------------------------
// Stack interno da aba Perfil, com telas: Perfil, Editar Perfil,
// Conquistas e Configurações
// -------------------------------------------------------------

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useTheme';

// Telas
import ProfileScreen from '@/screens/ProfileScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import AchievementsScreen from '@/screens/AchievementsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
        animation: 'slide_from_right',
      }}
    >
      {/* Tela principal do perfil */}
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Editar perfil */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Editar Perfil',
          headerShown: true,
        }}
      />

      {/* Conquistas */}
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          title: 'Conquistas',
          headerShown: true,
        }}
      />

      {/* Configurações */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

// App.tsx
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavTheme,
} from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from '@/navigation/AppNavigator';

// Providers
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { UserProvider } from '@/contexts/UserContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WellnessProvider } from '@/contexts/WellnessContext';
import { AchievementsProvider } from '@/contexts/AchievementsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { HabitsProvider } from '@/contexts/HabitsContext';
import { MoodProvider } from '@/contexts/MoodContext';
import { RemindersProvider } from '@/contexts/RemindersContext';

import { useMoodPrompts } from '@/hooks/useMoodPrompts';
import { notificationManager } from '@/utils/NotificationManager';

function InnerNavigation() {
  const { theme, isDark } = useTheme();
  const base = isDark ? NavDarkTheme : NavDefaultTheme;

  const navTheme: NavTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.secondary,
    },
  };

  useMoodPrompts();

  useEffect(() => {
    notificationManager.initialize();
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>

        <ThemeProvider>
          <UserProvider>
            <SettingsProvider>
              <NotificationProvider>
                <WellnessProvider>
                  <HabitsProvider>
                    <MoodProvider>
                      <RemindersProvider>
                        <AchievementsProvider>
                          <InnerNavigation />
                        </AchievementsProvider>
                      </RemindersProvider>
                    </MoodProvider>
                  </HabitsProvider>
                </WellnessProvider>
              </NotificationProvider>
            </SettingsProvider>
          </UserProvider>
        </ThemeProvider>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

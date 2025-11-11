import "react-native-reanimated";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
  Theme as NavTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

import AppNavigator from "@/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { WellnessProvider } from "@/contexts/WellnessContext";
import { AchievementsProvider } from "@/contexts/AchievementsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { logEvent } from "@/services/AnalyticsService"; // 👈 Novo

Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

  const { user } = useUser();

  // 📊 Evento: app aberto
  useEffect(() => {
    logEvent({ type: "app_opened", userId: user?.id });
  }, [user]);

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
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
              <WellnessProvider>
                <NotificationProvider>
                  <AchievementsProvider>
                    <InnerNavigation />
                  </AchievementsProvider>
                </NotificationProvider>
              </WellnessProvider>
            </SettingsProvider>
          </UserProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

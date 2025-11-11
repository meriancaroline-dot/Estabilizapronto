// -------------------------------------------------------------
// src/navigation/BottomTabs.tsx
// -------------------------------------------------------------
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

// Telas principais
import DashboardScreen from "@/screens/DashboardScreen";
import MoodScreen from "@/screens/MoodScreen";
import TasksAndRemindersScreen from "@/screens/TasksAndRemindersScreen";
import HabitsScreen from "@/screens/HabitsScreen";
import NotesScreen from "@/screens/NotesScreen";
import StatsScreen from "@/screens/StatsScreen";
import ProfessionalsScreen from "@/screens/ProfessionalsScreen";
import ProfileNavigator from "@/navigation/ProfileNavigator";

import { RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          position: "absolute",
          elevation: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Mood":
              iconName = focused ? "happy" : "happy-outline";
              break;
            case "Reminders":
              iconName = focused ? "notifications" : "notifications-outline";
              break;
            case "Habits":
              iconName = focused ? "repeat" : "repeat-outline";
              break;
            case "Notes":
              iconName = focused ? "document-text" : "document-text-outline";
              break;
            case "Stats":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
            case "Professionals":
              iconName = focused ? "people" : "people-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Início" }}
      />
      <Tab.Screen
        name="Mood"
        component={MoodScreen}
        options={{ title: "Humor" }}
      />
      <Tab.Screen
        name="Reminders"
        component={TasksAndRemindersScreen}
        options={{ title: "Lembretes" }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{ title: "Hábitos" }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: "Notas" }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ title: "Estatísticas" }}
      />
      <Tab.Screen
        name="Professionals"
        component={ProfessionalsScreen}
        options={{ title: "Profissionais" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

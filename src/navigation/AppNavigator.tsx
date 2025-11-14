// -------------------------------------------------------------
// src/navigation/AppNavigator.tsx
// -------------------------------------------------------------
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import BottomTabs from "./BottomTabs";
import { RootStackParamList } from "./types";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";

// 🔐 Telas de autenticação
import LoginScreen from "@/screens/LoginScreen";
import RegisterScreen from "@/screens/RegisterScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";

// ⭐ Telas do módulo de parceiros
import PartnersScreen from "@/screens/PartnersScreen";
import PartnerDetailScreen from "@/screens/PartnerDetailScreen";

// ⭐ Tela de Modo Crise (AGORA ATIVADA)
import CrisisScreen from "@/screens/CrisisScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const { user, loading } = useUser();

  // Loader inicial
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: "bold" },
        animation: "slide_from_right",
      }}
    >
      {user ? (
        <>
          {/* Telas principais */}
          <Stack.Screen
            name="Tabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />

          {/* Parceiros */}
          <Stack.Screen
            name="PartnersScreen"
            component={PartnersScreen}
            options={{
              title: "Parceiros Estabiliza",
              headerBackTitle: "Voltar",
            }}
          />

          <Stack.Screen
            name="PartnerDetail"
            component={PartnerDetailScreen}
            options={{
              title: "Detalhes do Parceiro",
              headerBackTitle: "Voltar",
            }}
          />

          {/* ⭐ Tela de Modo Crise — AGORA FUNCIONANDO */}
          <Stack.Screen
            name="CrisisScreen"
            component={CrisisScreen}
            options={{
              title: "Modo Crise",
              headerBackTitle: "Voltar",
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: "Criar conta",
              headerBackTitle: "Voltar",
            }}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              title: "Recuperar senha",
              headerBackTitle: "Voltar",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

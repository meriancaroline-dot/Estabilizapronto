// -------------------------------------------------------------
// src/navigation/AppNavigator.tsx
// -------------------------------------------------------------
// Stack raiz do app — decide se mostra o login ou o app
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const { user, loading } = useUser();

  // Mostra um mini loader enquanto verifica login salvo
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
        // ✅ Usuário logado → mostra as abas principais
        <Stack.Screen
          name="Tabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
      ) : (
        // 🚪 Usuário deslogado → mostra telas de autenticação
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

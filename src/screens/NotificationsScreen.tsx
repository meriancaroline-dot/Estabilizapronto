import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function NotificationsScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18 }}>
        🔔 Configurações de notificações — em breve
      </Text>
    </View>
  );
}

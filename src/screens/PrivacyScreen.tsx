import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function PrivacyScreen() {
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
        🔒 Privacidade — em breve
      </Text>
    </View>
  );
}

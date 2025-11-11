import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function AppearanceScreen() {
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
        🎨 Aparência e tema — em breve
      </Text>
    </View>
  );
}

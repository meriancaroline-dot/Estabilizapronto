import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  blurIntensity?: number;
  onPress?: () => void;
}

export default function GlassCard({
  children,
  style,
  blurIntensity = 25,
  onPress,
}: GlassCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={blurIntensity}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={[
          styles.card,
          {
            backgroundColor:
              theme.mode === "dark"
                ? "rgba(40, 36, 48, 0.55)"
                : "rgba(255, 255, 255, 0.55)",
            borderColor: theme.colors.border + "40",
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              shadowColor:
                theme.mode === "dark" ? "#000000" : theme.colors.primary,
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inner: {
    padding: 18,
  },
});

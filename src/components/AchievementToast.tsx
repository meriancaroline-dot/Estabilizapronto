import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  title: string;
  icon?: string;
  onHide: () => void;
}

export function AchievementToast({ title, icon = "🏆", onHide }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const slide = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrada
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Saída automática
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: -80,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 2600);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [{ translateY: slide }],
          opacity: opacity,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Nova conquista: <Text style={{ fontWeight: "700" }}>{title}</Text>
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    maxWidth: 180,
  },
});

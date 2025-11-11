import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";

interface ProgressCircleProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1 (fração)
  label?: string;
  color?: string; // ✅ adicionado
}

export default function ProgressCircle({
  size = 120,
  strokeWidth = 12,
  progress,
  label,
  color,
}: ProgressCircleProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, progress));
  const offset = circumference - pct * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color || colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            fill="transparent"
          />
        </G>
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.percent, { color: colors.text }]}>{Math.round(pct * 100)}%</Text>
        {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
  },
});

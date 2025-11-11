import React, { useMemo } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { BarChart } from "react-native-chart-kit";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ChartProps {
  title?: string;
  data?: {
    labels: string[];
    values: number[];
  };
}

export const Chart: React.FC<ChartProps> = ({ title, data }) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get("window").width - 32;

  const average = useMemo(() => {
    if (!data?.values?.length) return 0;
    return data.values.reduce((a, b) => a + b, 0) / data.values.length;
  }, [data]);

  // 🎨 Cores adaptadas ao humor médio
  const dynamicColor = useMemo(() => {
    if (average >= 80) return "#4ade80"; // verde feliz
    if (average >= 60) return "#facc15"; // amarelo estável
    if (average >= 40) return "#fb923c"; // laranja cansado
    return "#ef4444"; // vermelho pra baixo
  }, [average]);

  if (!data || !data.values.length) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[styles.emptyContainer, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={{ color: theme.colors.textSecondary }}>
          Nenhum dado disponível
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut}
      style={[styles.wrapper, { backgroundColor: theme.colors.surface }]}
    >
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      )}

      <BarChart
        data={{
          labels: data.labels,
          datasets: [{ data: data.values }],
        }}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: theme.colors.surface,
          backgroundGradientTo: theme.colors.surface,
          color: () => dynamicColor,
          labelColor: () => theme.colors.textSecondary,
          fillShadowGradient: dynamicColor,
          fillShadowGradientOpacity: 0.8,
          barPercentage: 0.45,
          decimalPlaces: 0,
        }}
        style={styles.chart}
      />

      <Text
        style={[
          styles.avgText,
          {
            color: dynamicColor,
          },
        ]}
      >
        Humor médio: {average.toFixed(1)}%
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
  },
  avgText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 12,
  },
});

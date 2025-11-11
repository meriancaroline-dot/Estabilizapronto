import React, { useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useDashboardUI } from "@/hooks/useDashboardUI";
import { useMood } from "@/hooks/useMood";
import { useUser } from "@/hooks/useUser";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootTabParamList } from "@/navigation/types";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { summary, tips, shortcuts } = useDashboardUI();
  const { moods } = useMood();
  const { user } = useUser();

  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const colors = theme.colors;

  // 👤 Saudação dinâmica
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const name =
      user?.name && user.name.trim().length > 0
        ? user.name.split(" ")[0]
        : "usuário";
    if (h < 12) return `Bom dia, ${name}`;
    if (h < 18) return `Boa tarde, ${name}`;
    return `Boa noite, ${name}`;
  }, [user]);

  const lastMood = moods[moods.length - 1];
  const moodText = lastMood?.mood || "em paz";
  const moodEmoji = lastMood?.emoji || "🌿";

  const handleShortcutPress = (target: keyof RootTabParamList) => {
    if (!target) return console.warn("Atalho sem destino definido.");
    navigation.navigate(target);
  };

  // 👇 Define humor predominante/médio do dia
  const todayMood = useMemo(() => {
    if (!moods.length) return { text: "Equilibrado", emoji: "🌿" };

    // Filtra só os registros de hoje
    const today = new Date().toDateString();
    const todayMoods = moods.filter(
      (m) => new Date(m.date).toDateString() === today
    );

    if (todayMoods.length === 0)
      return { text: moodText, emoji: moodEmoji };

    // Conta qual humor mais aparece
    const freq: Record<string, number> = {};
    todayMoods.forEach((m) => {
      freq[m.mood] = (freq[m.mood] || 0) + 1;
    });

    const predominant = Object.keys(freq).reduce((a, b) =>
      freq[a] > freq[b] ? a : b
    );

    const match = todayMoods.find((m) => m.mood === predominant);
    return { text: match?.mood || predominant, emoji: match?.emoji || "🌿" };
  }, [moods]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Seu humor atual: {moodText.toLowerCase()} {moodEmoji}
            </Text>
          </View>

          {/* Atalhos */}
          <View style={styles.shortcutsGrid}>
            {shortcuts.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleShortcutPress(item.target)}
                style={[
                  styles.shortcut,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color={colors.text} />
                <Text
                  style={[styles.shortcutLabel, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cards de resumo minimalistas */}
          <View style={styles.summaryRow}>
            {[
              {
                label: "Desempenho",
                color: colors.primary,
                icon: "bar-chart-outline",
                value: parseInt(summary?.performance ?? "0"),
              },
              {
                label: "Consistência",
                color: colors.success,
                icon: "repeat-outline",
                value: parseInt(summary?.consistency ?? "0"),
              },
            ].map((item, i) => (
              <View
                key={i}
                style={[styles.summaryCard, { backgroundColor: colors.surface }]}
              >
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: item.color, width: `${item.value}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: item.color }]}>
                  {item.value}%
                </Text>
              </View>
            ))}

            {/* Humor — agora exibe texto + emoji */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="happy-outline" size={20} color={colors.warning} />
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Humor
              </Text>
              <Text style={[styles.moodText, { color: colors.warning }]}>
                {todayMood.text} {todayMood.emoji}
              </Text>
            </View>
          </View>

          {/* Card: O que temos para hoje */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              O que temos para hoje
            </Text>
            <Text style={[styles.cardText, { color: colors.textSecondary }]}>
              Nenhum lembrete programado ainda.
            </Text>
          </View>

          {/* Dicas */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Dicas para você</Text>
            {tips.map((t, i) => (
              <Text key={i} style={[styles.cardText, { color: colors.textSecondary }]}>
                • {t}
              </Text>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// 💅 Estilos
// -------------------------------------------------------------
const CARD_RADIUS = 20;
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  header: {
    marginTop: 56,
    marginBottom: 26,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "600",
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },

  // Atalhos
  shortcutsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    marginBottom: 28,
  },
  shortcut: {
    width: "30%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  shortcutLabel: {
    fontSize: 13,
    marginTop: 6,
  },

  // Cards
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  summaryCard: {
    width: (width - 20 * 2 - 12 * 2) / 3,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  progressBar: {
    width: "80%",
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  moodText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },

  // Cards grandes
  card: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

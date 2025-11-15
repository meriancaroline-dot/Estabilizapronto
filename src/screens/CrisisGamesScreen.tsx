// -------------------------------------------------------------
// src/screens/CrisisGamesScreen.tsx
// Mini-jogos de crise em um só lugar (com modal)
// -------------------------------------------------------------
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

// Para tipar de forma leve sem brigar com o tema
type Colors = any;

type GameId =
  | "bubble_focus"
  | "grounding_54321"
  | "color_match"
  | "tap_alternating";

const GAMES: {
  id: GameId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: "primary" | "success" | "secondary" | "warning";
}[] = [
  {
    id: "bubble_focus",
    title: "Bolhas de foco",
    subtitle: "Toque nas bolhas e siga o ritmo da respiração.",
    icon: "radio-button-on-outline",
    colorKey: "primary",
  },
  {
    id: "grounding_54321",
    title: "5–4–3–2–1",
    subtitle: "Use os sentidos para voltar para o presente.",
    icon: "eye-outline",
    colorKey: "success",
  },
  {
    id: "color_match",
    title: "Jogo das cores",
    subtitle: "Toque a cor certa antes do tempo acabar.",
    icon: "color-palette-outline",
    colorKey: "secondary",
  },
  {
    id: "tap_alternating",
    title: "Toque alternado",
    subtitle: "Toques bilaterais para desacelerar o sistema.",
    icon: "swap-horizontal-outline",
    colorKey: "warning",
  },
];

// -------------------------------------------------------------
// JOGO 1 — Bolhas de foco
// -------------------------------------------------------------
const BubbleFocusGame: React.FC<{ colors: Colors }> = ({ colors }) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const [taps, setTaps] = useState(0);

  const handlePress = () => {
    setTaps((old) => old + 1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 160,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }),
    ]).start();
  };

  const levelHint =
    taps < 10
      ? "Continue tocando no seu tempo."
      : taps < 25
      ? "Você já criou um pequeno ritmo."
      : "Seu corpo já entendeu que está um pouco mais seguro.";

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameTitle, { color: colors.text }]}>
        Bolhas de foco
      </Text>
      <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
        Toque na bolha, inspire quando ela crescer e solte o ar quando voltar
        ao tamanho normal. Não precisa ser perfeito, só constante.
      </Text>

      <View style={styles.bubbleWrapper}>
        <Animated.View
          style={[
            styles.bubble,
            {
              backgroundColor: colors.primary + "22",
              borderColor: colors.primary,
              transform: [{ scale }],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={styles.bubbleInner}
          >
            <Text style={[styles.bubbleText, { color: colors.primary }]}>
              toque aqui
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.gameInfoBox}>
        <Text style={[styles.gameInfoNumber, { color: colors.primary }]}>
          {taps}
        </Text>
        <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>
          toques realizados
        </Text>
        <Text
          style={[styles.gameInfoHint, { color: colors.textSecondary }]}
        >
          {levelHint}
        </Text>
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// JOGO 2 — Técnica 5–4–3–2–1
// -------------------------------------------------------------
const Grounding54321Game: React.FC<{ colors: Colors }> = ({ colors }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "5 coisas que você pode ver",
      text: "Olhe ao redor e nomeie mentalmente cinco coisas que você consegue ver agora.",
    },
    {
      title: "4 coisas que você pode tocar",
      text: "Perceba quatro coisas que você consegue sentir com o tato. Texturas, temperatura, contato.",
    },
    {
      title: "3 coisas que você pode ouvir",
      text: "Repare em três sons diferentes — mesmo que sejam bem sutis.",
    },
    {
      title: "2 cheiros que você sente",
      text: "Note dois cheiros, mesmo que seja o cheiro do ambiente ou da própria pele.",
    },
    {
      title: "1 gosto na boca",
      text: "Perceba um gosto que esteja presente agora — água, saliva, algo que comeu recentemente.",
    },
  ];

  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (!isLast) setStep((s) => s + 1);
  };

  const handleReset = () => setStep(0);

  const s = steps[step];

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameTitle, { color: colors.text }]}>
        Técnica 5–4–3–2–1
      </Text>
      <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
        Use seus sentidos para lembrar o seu corpo de que você está aqui e
        agora. Não precisa fazer perfeito, só tentar.
      </Text>

      <View
        style={[
          styles.stepBadge,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.stepBadgeText, { color: colors.textSecondary }]}>
          Etapa {step + 1} de {steps.length}
        </Text>
      </View>

      <View
        style={[
          styles.groundingCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.groundingTitle, { color: colors.text }]}>
          {s.title}
        </Text>
        <Text
          style={[styles.groundingText, { color: colors.textSecondary }]}
        >
          {s.text}
        </Text>
      </View>

      <View style={styles.groundingButtonsRow}>
        {!isLast ? (
          <TouchableOpacity
            style={[
              styles.primaryAction,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              Concluí esta etapa
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryAction,
              { backgroundColor: colors.success },
            ]}
            onPress={handleReset}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              Recomeçar sequência
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.groundingFooterText,
          { color: colors.textSecondary },
        ]}
      >
        Se em algum momento cansar, você pode parar. Só de ter começado, já é
        um esforço enorme.
      </Text>
    </View>
  );
};

// -------------------------------------------------------------
// JOGO 3 — Jogo das cores (Color Match)
// -------------------------------------------------------------
const ColorMatchGame: React.FC<{ colors: Colors }> = ({ colors }) => {
  const [targetIndex, setTargetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);

  const localTimer = React.useRef<NodeJS.Timeout | null>(null);

  const palette = [
    { id: "vermelho", label: "vermelho", color: "#F97373" },
    { id: "azul", label: "azul", color: "#60A5FA" },
    { id: "verde", label: "verde", color: "#4ADE80" },
    { id: "amarelo", label: "amarelo", color: "#FACC15" },
  ];

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setIsRunning(true);
    setTargetIndex(Math.floor(Math.random() * palette.length));
  };

  const stop = () => {
    setIsRunning(false);
    if (localTimer.current) clearInterval(localTimer.current);
  };

  React.useEffect(() => {
    if (!isRunning) return;

    if (localTimer.current) clearInterval(localTimer.current);

    localTimer.current = setInterval(() => {
      setTimeLeft((old) => {
        if (old <= 1) {
          stop();
          return 0;
        }
        return old - 1;
      });
    }, 1000);

    return () => {
      if (localTimer.current) clearInterval(localTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const handleColorPress = (index: number) => {
    if (!isRunning) return;
    if (index === targetIndex) {
      setScore((s) => s + 1);
    }
    setTargetIndex(Math.floor(Math.random() * palette.length));
  };

  const target = palette[targetIndex];

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameTitle, { color: colors.text }]}>
        Jogo das cores
      </Text>
      <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
        Toque sempre na cor pedida. Não é sobre acertar tudo, é sobre dar ao
        cérebro algo simples e concreto para focar.
      </Text>

      <View style={styles.colorMatchHeaderRow}>
        <View
          style={[
            styles.timerPill,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.timerPillText,
              { color: colors.textSecondary },
            ]}
          >
            {timeLeft}s
          </Text>
        </View>

        <View
          style={[
            styles.scorePill,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="trophy-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            {score} pts
          </Text>
        </View>
      </View>

      <View style={styles.targetRow}>
        <Text style={[styles.targetLabel, { color: colors.text }]}>
          Toque na cor:
        </Text>
        <Text
          style={[
            styles.targetColorName,
            { color: colors.primary },
          ]}
        >
          {target.label}
        </Text>
      </View>

      <View style={styles.colorsGrid}>
        {palette.map((c, index) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.colorButton,
              { backgroundColor: c.color },
            ]}
            onPress={() => handleColorPress(index)}
            activeOpacity={0.9}
          >
            <Text style={styles.colorButtonText}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.groundingButtonsRow}>
        {!isRunning && timeLeft === 30 && (
          <TouchableOpacity
            style={[
              styles.primaryAction,
              { backgroundColor: colors.primary },
            ]}
            onPress={start}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>Iniciar jogo</Text>
          </TouchableOpacity>
        )}

        {!isRunning && timeLeft === 0 && (
          <TouchableOpacity
            style={[
              styles.primaryAction,
              { backgroundColor: colors.primary },
            ]}
            onPress={start}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>
              Recomeçar ({score} pts)
            </Text>
          </TouchableOpacity>
        )}

        {isRunning && (
          <TouchableOpacity
            style={[
              styles.secondaryAction,
              { borderColor: colors.border },
            ]}
            onPress={stop}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.secondaryActionText,
                { color: colors.textSecondary },
              ]}
            >
              Pausar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// JOGO 4 — Toque alternado (bilateral)
// -------------------------------------------------------------
const TapAlternatingGame: React.FC<{ colors: Colors }> = ({ colors }) => {
  const [lastSide, setLastSide] = useState<"left" | "right" | null>(null);
  const [streak, setStreak] = useState(0);

  const handlePress = (side: "left" | "right") => {
    if (!lastSide || lastSide === side) {
      setStreak((s) => (s === 0 ? 1 : 1)); // reinicia
    } else {
      setStreak((s) => s + 1);
    }
    setLastSide(side);
  };

  const quality =
    streak === 0
      ? "Comece alternando os lados no seu ritmo."
      : streak < 10
      ? "Muito bom, continue trocando os lados."
      : "Seu cérebro já está percebendo um novo padrão.";

  return (
    <View style={styles.gameContainer}>
      <Text style={[styles.gameTitle, { color: colors.text }]}>
        Toque alternado
      </Text>
      <Text style={[styles.gameDescription, { color: colors.textSecondary }]}>
        Toque alternadamente nos lados esquerdo e direito. Isso ajuda a
        “organizar” um pouco os sinais que o cérebro está recebendo.
      </Text>

      <View style={styles.tapRow}>
        <TouchableOpacity
          style={[
            styles.tapSide,
            {
              backgroundColor: colors.surface,
              borderColor:
                lastSide === "left" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => handlePress("left")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="arrow-back-outline"
            size={26}
            color={colors.text}
          />
          <Text style={[styles.tapLabel, { color: colors.text }]}>
            Esquerda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tapSide,
            {
              backgroundColor: colors.surface,
              borderColor:
                lastSide === "right" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => handlePress("right")}
          activeOpacity={0.85}
        >
          <Ionicons
            name="arrow-forward-outline"
            size={26}
            color={colors.text}
          />
          <Text style={[styles.tapLabel, { color: colors.text }]}>
            Direita
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gameInfoBox}>
        <Text style={[styles.gameInfoNumber, { color: colors.primary }]}>
          {streak}
        </Text>
        <Text style={[styles.gameInfoLabel, { color: colors.textSecondary }]}>
          toques alternados
        </Text>
        <Text
          style={[styles.gameInfoHint, { color: colors.textSecondary }]}
        >
          {quality}
        </Text>
      </View>
    </View>
  );
};

// -------------------------------------------------------------
// TELA PRINCIPAL — CrisisGamesScreen
// -------------------------------------------------------------
export default function CrisisGamesScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);

  const closeGame = () => setSelectedGame(null);

  const renderGame = () => {
    if (!selectedGame) return null;
    if (selectedGame === "bubble_focus") {
      return <BubbleFocusGame colors={colors} />;
    }
    if (selectedGame === "grounding_54321") {
      return <Grounding54321Game colors={colors} />;
    }
    if (selectedGame === "color_match") {
      return <ColorMatchGame colors={colors} />;
    }
    if (selectedGame === "tap_alternating") {
      return <TapAlternatingGame colors={colors} />;
    }
    return null;
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Ferramentas de aterramento
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Mini jogos para quando a cabeça está acelerada demais. Escolha um
            deles e use como âncora — do seu jeito, no seu tempo.
          </Text>
        </View>

        {/* Lista de jogos */}
        <View style={styles.gamesGrid}>
          {GAMES.map((g) => {
            const accent = colors[g.colorKey];
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.9}
                onPress={() => setSelectedGame(g.id)}
              >
                <View
                  style={[
                    styles.gameIconCircle,
                    { backgroundColor: accent + "22" },
                  ]}
                >
                  <Ionicons name={g.icon} size={22} color={accent} />
                </View>
                <Text style={[styles.gameCardTitle, { color: colors.text }]}>
                  {g.title}
                </Text>
                <Text
                  style={[
                    styles.gameCardSubtitle,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {g.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal do jogo selecionado */}
      <Modal
        visible={!!selectedGame}
        animationType="slide"
        onRequestClose={closeGame}
      >
        <SafeAreaView
          style={[styles.modalSafe, { backgroundColor: colors.background }]}
          edges={["top", "left", "right"]}
        >
          <LinearGradient
            colors={[colors.background, colors.surface]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={[
                styles.modalBackButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={closeGame}
              activeOpacity={0.8}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Exercício de aterramento
            </Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {renderGame()}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Estilos
// -------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  gamesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  gameCard: {
    width: "48%",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  gameIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gameCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  gameCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Modal
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  modalBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Conteúdo dos jogos
  gameContainer: {
    marginTop: 16,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  // Bubble game
  bubbleWrapper: {
    alignItems: "center",
    marginVertical: 24,
  },
  bubble: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  gameInfoBox: {
    alignItems: "center",
    marginTop: 4,
  },
  gameInfoNumber: {
    fontSize: 28,
    fontWeight: "700",
  },
  gameInfoLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  gameInfoHint: {
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  // Grounding 5-4-3-2-1
  stepBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  groundingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  groundingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  groundingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  groundingButtonsRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  primaryAction: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryAction: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryActionText: {
    fontWeight: "500",
    fontSize: 13,
  },
  groundingFooterText: {
    fontSize: 12,
    marginTop: 10,
  },

  // Color match
  colorMatchHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  timerPillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "600",
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 14,
  },
  targetColorName: {
    fontSize: 16,
    fontWeight: "700",
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  colorButton: {
    flexBasis: "48%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  colorButtonText: {
    color: "#111827",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Tap alternado
  tapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 18,
  },
  tapSide: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tapLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});

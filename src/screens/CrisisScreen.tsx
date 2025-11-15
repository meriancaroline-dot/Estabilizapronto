// -------------------------------------------------------------
// src/screens/CrisisScreen.tsx
// -------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
  Vibration,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import { useNavigation } from "@react-navigation/native";

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
type BreathingPhase = {
  id: "inspire" | "hold" | "expire";
  label: string;
  seconds: number;
  helper: string;
};

const BREATHING_SEQUENCE: BreathingPhase[] = [
  {
    id: "inspire",
    label: "Inspire pelo nariz",
    seconds: 4,
    helper: "Puxe o ar devagar, enchendo o peito e a barriga.",
  },
  {
    id: "hold",
    label: "Segure o ar",
    seconds: 4,
    helper: "Segure o ar com suavidade, sem tensão.",
  },
  {
    id: "expire",
    label: "Solte o ar pela boca",
    seconds: 6,
    helper: "Solte o ar bem devagar, como se apagasse uma vela.",
  },
];

// -------------------------------------------------------------
// Tela principal
// -------------------------------------------------------------
export default function CrisisScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigation = useNavigation();
  const colors = theme.colors;

  const [simpleMode, setSimpleMode] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(
    BREATHING_SEQUENCE[0].seconds
  );

  const waveOpacity = useRef(new Animated.Value(0.4)).current;

  // -------------------------------------------------------------
  // Ajuste da linguagem pelo gênero
  // -------------------------------------------------------------
  const gender = user?.gender;

  const adjectiveSuffix =
    gender === "female"
      ? "a"
      : gender === "male"
      ? "o"
      : gender === "non_binary"
      ? ""
      : "o";

  const sozinSuffix =
    gender === "female"
      ? "a"
      : gender === "male"
      ? "o"
      : gender === "non_binary"
      ? "he"
      : "o";

  const juntSuffix =
    gender === "female"
      ? "as"
      : gender === "male"
      ? "os"
      : gender === "non_binary"
      ? "es"
      : "os";

  const adj = (root: string) => `${root}${adjectiveSuffix}`;
  const soz = () => `sozin${sozinSuffix}`;

  const crisisSubtitle = `Vamos passar por isso junt${juntSuffix}, um passo de cada vez.`;

  // -------------------------------------------------------------
  // Contato de confiança do perfil
  // -------------------------------------------------------------
  const trustLabel =
    user?.emergencyContactName?.trim() || "Contato de confiança";
  const trustPhone = user?.emergencyContactPhone?.trim() || "";
  const trustRelation = user?.emergencyContactRelation?.trim() || "";

  // -------------------------------------------------------------
  // Fundo animado "onda"
  // -------------------------------------------------------------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveOpacity, {
          toValue: 0.4,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [waveOpacity]);

  // -------------------------------------------------------------
  // Respiração guiada
  // -------------------------------------------------------------
  useEffect(() => {
    if (!breathingActive) return;

    const phase = BREATHING_SEQUENCE[currentPhaseIndex];
    Vibration.vibrate(phase.id === "expire" ? 400 : 150);

    setCountdown(phase.seconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextIndex =
            (currentPhaseIndex + 1) % BREATHING_SEQUENCE.length;
          setCurrentPhaseIndex(nextIndex);
          return BREATHING_SEQUENCE[nextIndex].seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, currentPhaseIndex]);

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setCurrentPhaseIndex(0);
      setCountdown(BREATHING_SEQUENCE[0].seconds);
      Vibration.cancel();
      return;
    }
    setBreathingActive(true);
  };

  // -------------------------------------------------------------
  // Chamada de emergência
  // -------------------------------------------------------------
  const callNumber = async (num: string) => {
    const url = `tel:${num}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error();
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível iniciar a chamada.");
    }
  };

  const handleTrustedContact = () => {
    if (!trustPhone) {
      Alert.alert(
        "Contato de confiança",
        "Você ainda não cadastrou um contato de emergência no seu perfil. Vá em Configurações → Editar perfil para adicionar alguém de confiança."
      );
      return;
    }

    const relationSuffix = trustRelation ? ` (${trustRelation})` : "";

    Alert.alert(
      "Falar com alguém de confiança",
      `Você quer ligar para ${trustLabel}${relationSuffix}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Ligar", onPress: () => callNumber(trustPhone) },
      ]
    );
  };

  const currentPhase = BREATHING_SEQUENCE[currentPhaseIndex];

  // -------------------------------------------------------------
  // RETORNO
  // -------------------------------------------------------------
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.waveOverlay,
          { opacity: waveOpacity, backgroundColor: colors.surface },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Modo de crise
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.textSecondary }]}
            >
              {crisisSubtitle}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.simpleToggle,
              {
                borderColor: colors.border,
                backgroundColor: simpleMode
                  ? colors.surface
                  : "transparent",
              },
            ]}
            onPress={() => setSimpleMode((prev) => !prev)}
          >
            <Ionicons
              name="text-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.simpleToggleText,
                { color: colors.textSecondary },
              ]}
            >
              Texto grande
            </Text>
          </TouchableOpacity>
        </View>

        {/* BLOCO 1 — EMERGÊNCIA */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="warning-outline"
                size={22}
                color={colors.warning}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Estou em perigo imediato
              </Text>
            </View>
          </View>

          {!simpleMode && (
            <Text
              style={[styles.cardText, { color: colors.textSecondary }]}
            >
              Se você sente que pode se machucar agora ou alguém ao seu
              redor está em risco, o passo mais importante é pedir ajuda
              imediata.
            </Text>
          )}

          <View style={styles.emergencyRow}>
            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#D7263D" }]}
              onPress={() => callNumber("188")}
            >
              <Ionicons name="heart" size={20} color="#FFF" />
              <Text style={styles.emergencyText}>CVV • 188</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#1557FF" }]}
              onPress={() => callNumber("190")}
            >
              <Ionicons name="shield-outline" size={20} color="#FFF" />
              <Text style={styles.emergencyText}>Polícia • 190</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emergencyRow}>
            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#FF8A00" }]}
              onPress={() => callNumber("193")}
            >
              <Ionicons name="flame-outline" size={20} color="#FFF" />
              <Text style={styles.emergencyText}>Bombeiros • 193</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#008F39" }]}
              onPress={() => callNumber("192")}
            >
              <Ionicons name="medkit-outline" size={20} color="#FFF" />
              <Text style={styles.emergencyText}>SAMU • 192</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BLOCO 2 — ANSIEDADE */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="pulse-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {`Estou muito ${adj("ansios")}`}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.cardText,
              {
                color: colors.textSecondary,
                fontSize: simpleMode ? 15 : 14,
              },
            ]}
          >
            Sinais comuns: coração acelerado, pensamentos correndo,
            sensação de que “algo ruim vai acontecer”, respiração curta.
          </Text>

          {!simpleMode && (
            <>
              <Text
                style={[
                  styles.cardText,
                  { color: colors.textSecondary, marginTop: 10 },
                ]}
              >
                Você não precisa controlar tudo agora. Só o próximo
                minuto.
              </Text>

              <Text
                style={[
                  styles.cardText,
                  { color: colors.textSecondary, marginTop: 6 },
                ]}
              >
                Vamos reduzir a velocidade do corpo, e os pensamentos vão
                acompanhar.
              </Text>
            </>
          )}
        </View>

        {/* BLOCO 3 — RESPIRAÇÃO */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="cloud-outline"
                size={22}
                color={colors.success}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Respiração guiada
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.breathToggle,
                {
                  backgroundColor: breathingActive
                    ? colors.success
                    : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={toggleBreathing}
            >
              <Ionicons
                name={breathingActive ? "pause" : "play"}
                size={16}
                color={breathingActive ? "#FFF" : colors.text}
              />
              <Text
                style={[
                  styles.breathToggleText,
                  {
                    color: breathingActive ? "#FFF" : colors.text,
                  },
                ]}
              >
                {breathingActive ? "Parar" : "Iniciar"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.phaseLabel, { color: colors.text }]}>
            {currentPhase.label}
          </Text>

          {!simpleMode && (
            <Text
              style={[
                styles.cardText,
                { color: colors.textSecondary, marginBottom: 12 },
              ]}
            >
              {currentPhase.helper}
            </Text>
          )}

          <View
            style={[
              styles.countdownBubble,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
          >
            <Text style={[styles.countdownText, { color: colors.text }]}>
              {countdown}s
            </Text>
          </View>

          <Text
            style={[
              styles.cardText,
              { color: colors.textSecondary, marginTop: 12 },
            ]}
          >
            Repita esse ciclo por alguns minutos. Se ficar cansativo, pode
            parar — não precisa forçar.
          </Text>
        </View>

        {/* BLOCO 4 — CONTATO DE CONFIANÇA */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {`Não quero passar por isso ${soz()}`}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.cardText,
              { color: colors.textSecondary },
            ]}
          >
            Quando tudo fica pesado, é muito mais difícil pensar em quem
            chamar ou o que fazer. Ter um pequeno plano ajuda.
          </Text>

          <TouchableOpacity
            style={[
              styles.trustBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                marginTop: 14,
              },
            ]}
            onPress={handleTrustedContact}
          >
            <Ionicons
              name="call-outline"
              size={18}
              color={colors.text}
            />
            <Text style={[styles.trustBtnText, { color: colors.text }]}>
              Falar com alguém de confiança
            </Text>
          </TouchableOpacity>

          {!simpleMode && (
            <>
              <Text
                style={[
                  styles.planTitle,
                  { color: colors.text, marginTop: 12 },
                ]}
              >
                Pequeno plano de segurança
              </Text>

              <Text
                style={[
                  styles.cardText,
                  { color: colors.textSecondary },
                ]}
              >
                • Saia do lugar onde está se sentindo pior{"\n"}
                • Tire objetos perigosos do alcance{"\n"}
                • Avise alguém: “Não estou bem, pode ficar comigo?”{"\n"}
                • Se a ideia de se machucar ficar forte, ligue para 188
              </Text>
            </>
          )}
        </View>

        {/* BLOCO 5 — MINI-JOGOS CALMANTES */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name="game-controller-outline"
                size={22}
                color={colors.primary}
              />
              <Text
                style={[styles.cardTitle, { color: colors.text }]}
              >
                Mini-jogos calmantes
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.cardText,
              { color: colors.textSecondary },
            ]}
          >
            Pequenos exercícios interativos que ajudam seu cérebro a
            desacelerar e recuperar estabilidade emocional.
          </Text>

          <TouchableOpacity
            style={[
              styles.trustBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.background,
                marginTop: 14,
              },
            ]}
            onPress={() => navigation.navigate("CrisisGames" as never)}
          >
            <Ionicons
              name="play-circle-outline"
              size={18}
              color={colors.text}
            />
            <Text
              style={[styles.trustBtnText, { color: colors.text }]}
            >
              Abrir mini-jogos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Estilos
// -------------------------------------------------------------
const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  waveOverlay: {
    position: "absolute",
    top: -80,
    left: -40,
    right: -40,
    height: 220,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 32,
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  simpleToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 12,
    gap: 6,
    alignSelf: "flex-start",
  },
  simpleToggleText: {
    fontSize: 11,
    fontWeight: "500",
  },

  card: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 18,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  emergencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 10,
  },
  emergencyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emergencyText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  breathToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  breathToggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  phaseLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  countdownBubble: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
  },
  countdownText: {
    fontSize: 18,
    fontWeight: "700",
  },

  trustBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 14,
  },
  trustBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
});

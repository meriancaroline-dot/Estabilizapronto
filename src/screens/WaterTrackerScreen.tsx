import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { useWaterTracker } from "@/hooks/useWaterTracker";

const { width } = Dimensions.get("window");

export default function WaterTrackerScreen() {
  const { theme } = useTheme();
  const {
    intake,
    goal,
    percent,
    history,
    addWater,
    removeWater,
    resetToday,
    setGoal,
  } = useWaterTracker();

  const colors = theme.colors;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [tempGoal, setTempGoal] = useState(String(goal));

  // animação do axolote
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const clampedPercent = Math.max(0, Math.min(percent, 100));
  const remaining = Math.max(goal - intake, 0);

  // mensagens acolhedoras
  const message = (() => {
    if (clampedPercent >= 100)
      return "Você se cuidou lindamente hoje ❤️ Seu corpo agradece cada gole.";
    if (clampedPercent >= 70)
      return "Você está nutrindo o seu corpo com carinho. Continue nesse ritmo.";
    if (clampedPercent >= 40)
      return "Você está se escutando e respeitando seu ritmo. Mais um gole?";
    if (clampedPercent > 0)
      return "Cada pequeno cuidado conta. Mesmo um gole já é afeto por você.";
    return "Seu corpo merece cuidado. Que tal começar com um gole de água?";
  })();

  // sprites
  const bottleSprite = (() => {
    if (clampedPercent >= 75) return require("../assets/bottle_75.png");
    if (clampedPercent >= 50) return require("../assets/bottle_50.png");
    if (clampedPercent > 0) return require("../assets/bottle_25.png");
    return require("../assets/bottle_empty.png");
  })();

  const axoSprite = (() => {
    if (clampedPercent >= 75) return require("../assets/axo_ancestral.png");
    if (clampedPercent >= 25) return require("../assets/axo_mid.png");
    return require("../assets/axo_baby.png");
  })();

  const handleAddWater = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addWater(amount);
  };

  // meta
  const presets = [1500, 2000, 2500, 3000];

  const openGoalModal = () => {
    setTempGoal(String(goal));
    setGoalModalVisible(true);
  };
  const handlePresetGoal = (value: number) => {
    setTempGoal(String(value));
    setGoal(value);
  };
  const handleConfirmGoal = () => {
    const value = parseInt(tempGoal.replace(/\D/g, ""), 10);
    if (!isNaN(value) && value > 0) setGoal(value);
    setGoalModalVisible(false);
  };

  // histórico textual
  const today = new Date().toISOString().split("T")[0];

  const listHistory = useMemo(() => {
    const base = [...history];
    const idx = base.findIndex((h) => h.date === today);

    if (idx >= 0) base[idx] = { date: today, amount: intake };
    else base.push({ date: today, amount: intake });

    return base.sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  }, [history, intake, today]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AXOLOTE */}
        <View style={styles.axoWrapper}>
          <View style={styles.axoAura} />
          <Animated.Image
            source={axoSprite}
            resizeMode="contain"
            style={[styles.axo, { transform: [{ translateY: floatAnim }] }]}
          />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Hidratação diária
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>

        <Text style={[styles.remaining, { color: colors.textSecondary }]}>
          Faltam {remaining}ml para sua meta de {goal}ml
        </Text>

        {/* GARRAFA COM MÁSCARA */}
        <View style={styles.bottleArea}>
          <View style={styles.bottleMask}>
            <View
              style={[
                styles.waterFill,
                {
                  height: `${clampedPercent}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
            <Animated.Image
              source={bottleSprite}
              resizeMode="contain"
              style={styles.bottle}
            />
          </View>
        </View>

        {/* CARD PRINCIPAL */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardRow}>
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Você bebeu
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {intake}ml
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Progresso
              </Text>
              <Text style={[styles.percent, { color: colors.primary }]}>
                {percent}%
              </Text>
            </View>
          </View>

          {/* progresso */}
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${clampedPercent}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>

          {/* BOTÕES */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: colors.background }]}
              onPress={() => removeWater(200)}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
              <Text style={{ color: colors.textSecondary }}>-200</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleAddWater(250)}
            >
              <Text style={styles.mainBtnText}>+250ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: colors.background }]}
              onPress={() => handleAddWater(500)}
            >
              <Ionicons name="add" size={18} color={colors.text} />
              <Text style={{ color: colors.textSecondary }}>+500</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={resetToday}
            style={[styles.resetBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="refresh" size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>
              Resetar dia
            </Text>
          </TouchableOpacity>
        </View>

        {/* ALTERAR META */}
        <TouchableOpacity onPress={openGoalModal} style={styles.changeGoal}>
          <Ionicons name="water" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, marginLeft: 6 }}>
            Ajustar meta de hidratação
          </Text>
        </TouchableOpacity>

        {/* HISTÓRICO */}
        <View style={styles.historyWrapper}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>
            Como você tem cuidado do seu corpo:
          </Text>

          {listHistory.length > 0 ? (
            listHistory.map((d) => (
              <Text
                key={d.date}
                style={[styles.historyItem, { color: colors.textSecondary }]}
              >
                {d.date.split("-").reverse().join("/")} — {d.amount}ml
              </Text>
            ))
          ) : (
            <Text style={[styles.historyEmpty, { color: colors.textSecondary }]}>
              Conforme você beber água ao longo dos dias, seus registros
              aparecerão aqui.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* MODAL META */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Definir meta diária</Text>
            <Text style={styles.modalSubtitle}>
              Escolha um valor que respeite seu corpo e seu ritmo.
            </Text>

            <View style={styles.presetsRow}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.presetBtn,
                    tempGoal === String(p) && styles.presetBtnActive,
                  ]}
                  onPress={() => handlePresetGoal(p)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      tempGoal === String(p) && styles.presetTextActive,
                    ]}
                  >
                    {p}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={tempGoal}
              onChangeText={setTempGoal}
              keyboardType="numeric"
              placeholder="Ou digite sua meta (ml)"
              style={styles.input}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirm} onPress={handleConfirmGoal}>
                <Text style={styles.modalConfirmText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 20,
    alignItems: "center",
  },

  axoWrapper: {
    marginBottom: 10,
    width: 95,
    height: 95,
    alignItems: "center",
    justifyContent: "center",
  },
  axoAura: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 90,
    backgroundColor: "#B4A5D955",
  },
  axo: {
    width: 82,
    height: 82,
  },

  title: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  message: { fontSize: 13, marginTop: 6, textAlign: "center", paddingHorizontal: 20 },
  remaining: { fontSize: 12, marginTop: 4, marginBottom: 12 },

  bottleArea: { alignItems: "center", marginBottom: 10 },
  bottleMask: {
    width: width * 0.5,
    height: width * 1.0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  waterFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    opacity: 0.85,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottle: { width: width * 0.5, height: width * 1.0 },

  card: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 5,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  label: { fontSize: 12 },
  value: { fontSize: 24, fontWeight: "700" },
  percent: { fontSize: 20, fontWeight: "700" },

  progressBg: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: { height: "100%", borderRadius: 10 },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  smallBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  mainBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  mainBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },

  resetBtn: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  changeGoal: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  historyWrapper: { marginTop: 20, width: "100%", paddingHorizontal: 24 },
  historyTitle: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  historyItem: { fontSize: 12, paddingVertical: 2 },
  historyEmpty: { fontSize: 12, textAlign: "center", paddingVertical: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "85%",
    borderRadius: 18,
    backgroundColor: "#FFF",
    padding: 18,
  },

  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  modalSubtitle: { fontSize: 12, color: "#555", marginBottom: 12 },

  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  presetBtnActive: { backgroundColor: "#B4A5D9", borderColor: "#B4A5D9" },

  presetText: { fontSize: 12, color: "#333" },
  presetTextActive: { color: "#FFF" },

  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 14,
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancel: { paddingHorizontal: 12, paddingVertical: 8 },
  modalCancelText: { fontSize: 13, color: "#666" },
  modalConfirm: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#B4A5D9",
  },
  modalConfirmText: { fontSize: 13, color: "#FFF", fontWeight: "600" },
});

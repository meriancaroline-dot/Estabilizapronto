import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useWaterTracker } from "@/hooks/useWaterTracker";

const { width } = Dimensions.get("window");

export default function WaterTrackerScreen() {
  const { theme } = useTheme();
  const { intake, goal, percent, addWater, removeWater, resetToday, setGoal } =
    useWaterTracker();

  const colors = theme.colors;

  const floatAnim = useRef(new Animated.Value(0)).current;

  // mascote flutuando
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

  // escolher sprite da garrafa
  const bottleSprite = (() => {
    if (percent >= 90) return require("../assets/bottle_full.png");
    if (percent >= 70) return require("../assets/bottle_75.png");
    if (percent >= 40) return require("../assets/bottle_50.png");
    if (percent > 0) return require("../assets/bottle_25.png");
    return require("../assets/bottle_empty.png");
  })();

  // escolher mascote
  const axoSprite = (() => {
    if (percent >= 75) return require("../assets/axo_ancestral.png");
    if (percent >= 25) return require("../assets/axo_mid.png");
    return require("../assets/axo_baby.png");
  })();

  // trocar meta (preset)
  const handleChangeGoal = () => {
    const presets = [1500, 2000, 2500, 3000];
    const next = presets[(presets.indexOf(goal) + 1) % presets.length];
    setGoal(next);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* PET FLUTUANDO */}
      <Animated.Image
        source={axoSprite}
        resizeMode="contain"
        style={[
          styles.pet,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      />

      <View style={styles.container}>
        {/* topo minimalista */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>
            Hidratação diária
          </Text>
          <TouchableOpacity
            onPress={handleChangeGoal}
            style={[
              styles.goalButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Ionicons name="water" size={16} color={colors.primary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              Meta: {goal}ml
            </Text>
          </TouchableOpacity>
        </View>

        {/* GARRAFA CENTRAL - ENORME E SEM FUNDO BRANCO */}
        <View style={styles.bottleWrapper}>
          <Animated.Image
            source={bottleSprite}
            resizeMode="contain"
            style={[
              styles.bottle,
              {
                tintColor:
                  percent > 100 ? "rgba(255,255,255,0.15)" : undefined,
              },
            ]}
          />

          {/* overlay para esconder o fundo do PNG FULL */}
          {percent >= 100 && (
            <View
              style={[
                styles.overlayFix,
                { backgroundColor: colors.background },
              ]}
            />
          )}
        </View>

        {/* CARD MENOR, ORGANIZADO E ALINHADO */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
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

          {/* barra de progresso */}
          <View
            style={[
              styles.progressContainer,
              { backgroundColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${percent}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>

          {/* botões */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[
                styles.smallBtn,
                { backgroundColor: colors.background },
              ]}
              onPress={() => removeWater(200)}
            >
              <Ionicons name="remove" size={18} color={colors.text} />
              <Text style={{ color: colors.textSecondary }}>-200</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: colors.primary }]}
              onPress={() => addWater(250)}
            >
              <Text style={styles.mainBtnText}>+250ml</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.smallBtn,
                { backgroundColor: colors.background },
              ]}
              onPress={() => addWater(500)}
            >
              <Ionicons name="add" size={18} color={colors.text} />
              <Text style={{ color: colors.textSecondary }}>+500</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={resetToday}
            style={[styles.resetBtn, { borderColor: colors.border }]}
          >
            <Ionicons
              name="refresh"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={{ color: colors.textSecondary, marginLeft: 6 }}>
              Resetar dia
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },

  pet: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 85,
    height: 85,
    zIndex: 10,
  },

  headerRow: {
    marginTop: 40,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: { fontSize: 15 },

  goalButton: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
    alignItems: "center",
  },

  bottleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  bottle: {
    width: width * 0.55,
    height: width * 1.1,
  },

  // overlay que remove o fundo branco do sprite FULL
  overlayFix: {
    position: "absolute",
    width: width * 0.55,
    height: width * 1.1,
    opacity: 0.4,
  },

  infoBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  label: { fontSize: 12 },
  value: { fontSize: 24, fontWeight: "700" },
  percent: { fontSize: 20, fontWeight: "700" },

  progressContainer: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },

  smallBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },

  mainBtn: {
    flex: 1.4,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  mainBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  resetBtn: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});

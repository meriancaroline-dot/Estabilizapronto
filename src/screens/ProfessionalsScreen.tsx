// -------------------------------------------------------------
// src/screens/ProfessionalsScreen.tsx
// -------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const WHATSAPP_NUMBER = "04896929261";
const IG_URL =
  "https://www.instagram.com/mentesbipolaresconectadas?utm_source=ig_web_button_share_sheet";

export default function ProfessionalsScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const navigation = useNavigation<any>();

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const openWhatsApp = async () => {
    const msg = "Olá! Gostaria de informações sobre atendimento.";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error();
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  const openInstagram = async () => {
    try {
      const supported = await Linking.canOpenURL(IG_URL);
      if (!supported) throw new Error();
      await Linking.openURL(IG_URL);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o Instagram.");
    }
  };

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
            <Text style={[styles.greeting, { color: colors.text }]}>
              Apoio Profissional
            </Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Encontre suporte qualificado para o seu bem-estar
            </Text>
          </View>

          {/* ⭐ Botão: Parceiros Estabiliza */}
          <TouchableOpacity
            style={[styles.partnersButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("PartnersScreen")}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={22} color="#FFF" />
            <Text style={styles.partnersButtonText}>Parceiros Estabiliza</Text>
          </TouchableOpacity>

          {/* Card: Profissionais Parceiros */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="people-outline"
                size={24}
                color={colors.primary}
              />
              <View style={styles.cardHeaderText}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Profissionais Parceiros
                </Text>
                <Text
                  style={[styles.cardSubtitle, { color: colors.textSecondary }]}
                >
                  Atendimento especializado
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.cardDescription,
                { color: colors.textSecondary },
              ]}
            >
              Rede de profissionais qualificados para atender suas necessidades
              de saúde mental e jurídicas.
            </Text>

            {/* Especialidades */}
            <View style={styles.specialtiesGrid}>
              <View
                style={[
                  styles.specialtyCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Ionicons name="fitness-outline" size={20} color={colors.text} />
                <Text
                  style={[styles.specialtyLabel, { color: colors.textSecondary }]}
                >
                  Psicólogos
                </Text>
              </View>

              <View
                style={[
                  styles.specialtyCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Ionicons name="medical-outline" size={20} color={colors.text} />
                <Text
                  style={[styles.specialtyLabel, { color: colors.textSecondary }]}
                >
                  Psiquiatras
                </Text>
              </View>

              <View
                style={[
                  styles.specialtyCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={colors.text}
                />
                <Text
                  style={[styles.specialtyLabel, { color: colors.textSecondary }]}
                >
                  Advogados
                </Text>
              </View>
            </View>

            {/* Info box */}
            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Consulte valores e funcionamento via WhatsApp
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={openWhatsApp}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
                <Text style={styles.primaryButtonText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={openInstagram}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-instagram" size={18} color={colors.text} />
                <Text
                  style={[styles.secondaryButtonText, { color: colors.text }]}
                >
                  Instagram
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Estilos
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

  partnersButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 26,
  },
  partnersButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  card: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  specialtiesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  specialtyCard: {
    width: (width - 20 * 2 - 18 * 2 - 12 * 2) / 3,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  specialtyLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 18,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});

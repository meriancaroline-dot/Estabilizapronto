import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/types";

// Tipos das rotas
type PartnerDetailRoute = RouteProp<RootStackParamList, "PartnerDetail">;

export default function PartnerDetailScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const route = useRoute<PartnerDetailRoute>();
  const partner = route.params?.partner;

  if (!partner) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: colors.text }}>
          Erro ao carregar informações do parceiro.
        </Text>
      </View>
    );
  }

  const openWhatsApp = async () => {
    if (!partner.whatsapp) {
      return Alert.alert("WhatsApp não disponível");
    }

    const url = `https://wa.me/${partner.whatsapp}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("Não suportado");

      Linking.openURL(url);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp.");
    }
  };

  const openInstagram = () => {
    if (!partner.instagram) {
      return Alert.alert("Instagram não disponível");
    }
    Linking.openURL(partner.instagram);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* IMAGEM */}
      {partner.image ? (
        <Image source={{ uri: partner.image }} style={styles.image} />
      ) : (
        <View style={[styles.noImage, { backgroundColor: colors.surface }]} />
      )}

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]}>
          {partner.name}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {partner.category}
        </Text>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
        >
          {partner.description}
        </Text>

        {/* ------------------------- */}
        {/* CONTATOS */}
        {/* ------------------------- */}
        <View style={styles.buttonsWrapper}>
          {partner.whatsapp && (
            <TouchableOpacity
              style={[styles.buttonPrimary, { backgroundColor: colors.primary }]}
              onPress={openWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.buttonPrimaryText}>WhatsApp</Text>
            </TouchableOpacity>
          )}

          {partner.instagram && (
            <TouchableOpacity
              style={[
                styles.buttonSecondary,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={openInstagram}
            >
              <Ionicons
                name="logo-instagram"
                size={20}
                color={colors.text}
              />
              <Text
                style={[styles.buttonSecondaryText, { color: colors.text }]}
              >
                Instagram
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// -------------------------------
// Estilos
// -------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },

  image: {
    width: "100%",
    height: 240,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  noImage: {
    width: "100%",
    height: 240,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  content: { padding: 20 },

  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    marginBottom: 16,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
  },

  buttonsWrapper: {
    flexDirection: "row",
    gap: 14,
    marginTop: 10,
  },

  buttonPrimary: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  buttonPrimaryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },

  buttonSecondary: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  buttonSecondaryText: {
    fontWeight: "600",
    fontSize: 15,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

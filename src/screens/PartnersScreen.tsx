import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

// -------------------------------
// Tipos
// -------------------------------
type Partner = {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  whatsapp?: string;
  instagram?: string;
  highlight?: boolean;
};

type PartnerCategory = {
  id: string;
  name: string;
};

// -------------------------------
// Tela principal
// -------------------------------
export default function PartnersScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation<any>();

  // -------------------------------
  // Carrega categorias e parceiros
  // -------------------------------
  useEffect(() => {
    (async () => {
      try {
        const categoriesSnap = await getDocs(
          collection(db, "partnerCategories")
        );
        const partnersSnap = await getDocs(collection(db, "partners"));

        setCategories(
          categoriesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );

        setPartners(
          partnersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );

        setLoading(false);
      } catch (e) {
        console.error(e);
        Alert.alert("Erro", "Não foi possível carregar os parceiros.");
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Carregando...</Text>
      </View>
    );
  }

  // parceiros em destaque
  const highlights = partners.filter((p) => p.highlight);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.header, { color: colors.text }]}>
        Estabelecimentos Parceiros
      </Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Locais que oferecem vantagens exclusivas para usuários Estabiliza
      </Text>

      {/* ------------------------- */}
      {/* Carrossel de destaque */}
      {/* ------------------------- */}
      {highlights.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 20 }}
        >
          {highlights.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={[styles.highlightCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate("PartnerDetail", { partner: h })}
            >
              {h.image ? (
                <Image source={{ uri: h.image }} style={styles.highlightImage} />
              ) : (
                <View style={styles.noImage} />
              )}
              <View style={styles.highlightOverlay}>
                <Text style={styles.highlightName}>{h.name}</Text>
                <Text style={styles.highlightCategory}>{h.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ------------------------- */}
      {/* Categorias */}
      {/* ------------------------- */}
      {categories.map((cat) => {
        const list = partners.filter((p) => p.category === cat.name);

        if (!list.length) return null;

        return (
          <View key={cat.id} style={styles.categoryBlock}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>
              {cat.name}
            </Text>

            {list.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.partnerCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => navigation.navigate("PartnerDetail", { partner: p })}
              >
                {p.image ? (
                  <Image source={{ uri: p.image }} style={styles.partnerImage} />
                ) : (
                  <View style={styles.partnerNoImage} />
                )}

                <View style={styles.partnerInfo}>
                  <Text style={[styles.partnerName, { color: colors.text }]}>
                    {p.name}
                  </Text>
                  <Text
                    style={[styles.partnerDesc, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {p.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// -------------------------------
// Estilos
// -------------------------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { fontSize: 24, fontWeight: "700" },
  sub: { marginTop: 4, fontSize: 13 },

  highlightCard: {
    width: 260,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 14,
  },
  highlightImage: { width: "100%", height: "100%" },
  noImage: { flex: 1, backgroundColor: "#ccc" },
  highlightOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  highlightName: { color: "#fff", fontWeight: "700", fontSize: 14 },
  highlightCategory: { color: "#eee", fontSize: 12 },

  categoryBlock: { marginTop: 26 },
  categoryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  partnerCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  partnerImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
  },
  partnerNoImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#ddd",
    marginRight: 12,
  },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: "600" },
  partnerDesc: { fontSize: 13, marginTop: 2 },
});

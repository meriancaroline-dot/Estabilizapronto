import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export default function CrisisScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const callNumber = async (num: string) => {
    const url = `tel:${num}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error();
      Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível iniciar a chamada.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Você está seguro agora?
      </Text>

      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Respira fundo. Estou aqui com você. O que você precisa agora?
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#D7263D" }]}
          onPress={() => callNumber("188")}
        >
          <Ionicons name="heart" size={22} color="#FFF" />
          <Text style={styles.btnText}>CVV – 188</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#1557FF" }]}
          onPress={() => callNumber("190")}
        >
          <Ionicons name="shield-outline" size={22} color="#FFF" />
          <Text style={styles.btnText}>Polícia – 190</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#FF8A00" }]}
          onPress={() => callNumber("193")}
        >
          <Ionicons name="flame-outline" size={22} color="#FFF" />
          <Text style={styles.btnText}>Bombeiros – 193</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#008F39" }]}
          onPress={() => callNumber("192")}
        >
          <Ionicons name="medkit-outline" size={22} color="#FFF" />
          <Text style={styles.btnText}>SAMU – 192</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
  },
  buttons: {
    gap: 14,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  btnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

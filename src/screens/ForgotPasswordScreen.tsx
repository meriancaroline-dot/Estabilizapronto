// -------------------------------------------------------------
// src/screens/ForgotPasswordScreen.tsx
// -------------------------------------------------------------
// Tela de recuperação de senha - Firebase + tema pastel Estabiliza
// -------------------------------------------------------------
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotPasswordScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        "E-mail enviado",
        "Verifique sua caixa de entrada para redefinir sua senha."
      );
      setEmail("");
    } catch (error: any) {
      console.error("Erro ao enviar e-mail:", error);
      if (error.code === "auth/user-not-found") {
        Alert.alert("Usuário não encontrado", "Este e-mail não está cadastrado.");
      } else {
        Alert.alert("Erro", "Não foi possível enviar o e-mail de redefinição.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Esqueceu sua senha?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Digite o e-mail cadastrado e enviaremos um link para redefinição.
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: loading ? colors.muted : colors.primary,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
              onPress={handleReset}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color="#FFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.buttonText}>
                {loading ? "Enviando..." : "Enviar link"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;

// -------------------------------------------------------------
// src/screens/RegisterScreen.tsx
// -------------------------------------------------------------
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register } = useUser();
  const colors = theme.colors;
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Ops!", "Preencha todos os campos.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const success = await register(name.trim(), email.trim(), password.trim());
      if (success) {
        Alert.alert("Sucesso", "Conta criada com sucesso!");
        navigation.navigate("Dashboard");
      } else {
        Alert.alert("Erro", "Esse e-mail já está cadastrado.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY }] },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Estabiliza</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Crie sua conta
          </Text>

          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nome completo"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="E-mail"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Senha */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Senha"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirmar senha"
                placeholderTextColor={colors.textSecondary}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Botão cadastrar */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: loading ? colors.border : colors.primary },
              ]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Criando conta..." : "Cadastrar"}
              </Text>
            </TouchableOpacity>

            {/* Voltar */}
            <TouchableOpacity onPress={handleNavigateLogin} activeOpacity={0.7}>
              <Text style={[styles.link, { color: colors.textSecondary }]}>
                Voltar ao login
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 40,
  },
  formCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 8,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
});

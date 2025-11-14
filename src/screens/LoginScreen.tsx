// src/screens/LoginScreen.tsx
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import { handleError } from "@/utils/errorHandler";

const REMEMBER_ME_KEY = "@estabiliza:rememberMe";

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login } = useUser();
  const colors = theme.colors;
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
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

  // Load remember me
  useEffect(() => {
    const loadRememberMe = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.remember && parsed?.email) {
            setRememberMe(true);
            setEmail(parsed.email);
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar rememberMe:", error);
      }
    };

    loadRememberMe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ops!", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());

      // Remember me save/remove
      if (rememberMe) {
        await AsyncStorage.setItem(
          REMEMBER_ME_KEY,
          JSON.stringify({
            remember: true,
            email: email.trim(),
          })
        );
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error) {
      handleError(error, "LoginScreen.handleLogin");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateRegister = () => {
    navigation.navigate("Register");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
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
            Entre para continuar
          </Text>

          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* E-mail */}
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
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Remember me + Forgot Password */}
            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe((prev) => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rememberMe ? "checkbox-outline" : "square-outline"}
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.rememberText, { color: colors.textSecondary }]}>
                  Lembrar e-mail
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={[styles.linkForgot, { color: colors.primary }]}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: loading ? colors.border : colors.primary },
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            {/* Criar conta */}
            <TouchableOpacity
              onPress={handleNavigateRegister}
              activeOpacity={0.7}
            >
              <Text style={[styles.link, { color: colors.textSecondary }]}>
                Criar conta
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rememberText: {
    fontSize: 13,
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
  linkForgot: {
    fontSize: 13,
    fontWeight: "500",
  },
  link: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
});

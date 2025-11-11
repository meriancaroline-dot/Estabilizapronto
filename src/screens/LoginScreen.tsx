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
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import { useNavigation } from "@react-navigation/native";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/services/firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login } = useUser();
  const colors = theme.colors;
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ⚙️ Configura o fluxo de login com Google (Expo Auth Session)
  const [request, , promptAsync] = Google.useAuthRequest({
    androidClientId: "SEU_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "SEU_IOS_CLIENT_ID.apps.googleusercontent.com",
    clientId: "SEU_EXPO_CLIENT_ID.apps.googleusercontent.com",
  });

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

  // -----------------------------------------------------------
  // Login por e-mail / senha
  // -----------------------------------------------------------
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Ops!", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password.trim());
      // Se der erro, o próprio UserContext já mostra Alert
    } catch {
      // erro já tratado no contexto
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // Login com Google (Firebase + Expo Auth Session)
  // -----------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      if (!request) {
        Alert.alert(
          "Atenção",
          "Configuração do login com Google ainda não está pronta."
        );
        return;
      }

      setGoogleLoading(true);
      const result = await promptAsync();

      if (result.type !== "success") {
        setGoogleLoading(false);
        return;
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        Alert.alert("Erro", "Não foi possível obter o token do Google.");
        setGoogleLoading(false);
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      // onAuthStateChanged no UserContext vai cuidar do resto
    } catch (e) {
      console.error("Erro no login com Google:", e);
      Alert.alert("Erro", "Não foi possível entrar com Google.");
    } finally {
      setGoogleLoading(false);
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
          {/* Logo / Título */}
          <Text style={[styles.title, { color: colors.text }]}>Estabiliza</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Entre para continuar
          </Text>

          {/* Card do formulário */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {/* E-mail */}
            <View
              style={[
                styles.inputGroup,
                { borderColor: colors.border },
              ]}
            >
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

            {/* Senha + Mostrar/Ocultar */}
            <View
              style={[
                styles.inputGroup,
                { borderColor: colors.border },
              ]}
            >
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textSecondary}
                />
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
              disabled={loading || googleLoading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            {/* Separador "ou" */}
            <View style={styles.separatorRow}>
              <View
                style={[
                  styles.separatorLine,
                  { backgroundColor: colors.border },
                ]}
              />
              <Text
                style={[
                  styles.separatorText,
                  { color: colors.textSecondary },
                ]}
              >
                ou entre com
              </Text>
              <View
                style={[
                  styles.separatorLine,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>

            {/* Botão Google */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: googleLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              disabled={googleLoading || loading}
            >
              <View style={styles.googleLogoCircle}>
                <Text style={{ fontSize: 16 }}>G</Text>
              </View>
              <Text
                style={[
                  styles.googleText,
                  { color: colors.text },
                ]}
              >
                {googleLoading ? "Conectando..." : "Continuar com Google"}
              </Text>
            </TouchableOpacity>

            {/* Links auxiliares */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={[styles.linkForgot, { color: colors.primary }]}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNavigateRegister}
              activeOpacity={0.7}
            >
              <Text style={[styles.link, { color: colors.textSecondary }]}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Espaço no final */}
          <View style={{ height: 120 }} />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    paddingBottom: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
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
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 8,
    fontSize: 13,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  googleLogoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  googleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  linkForgot: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },
  link: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
  },
});

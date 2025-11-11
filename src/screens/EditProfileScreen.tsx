// src/screens/EditProfileScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/Button";
import { useUser } from "@/hooks/useUser";
import { UserPreferences } from "@/types/models";

// -------------------------------------------------------------
// ✏️ Tela de Edição de Perfil — alterar nome, e-mail e avatar
// -------------------------------------------------------------
export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user, patchUser } = useUser();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);

  // Escolher novo avatar
  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return Alert.alert(
        "Permissão negada",
        "Precisamos de acesso à galeria para alterar seu avatar."
      );
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Salvar alterações
  const handleSave = async () => {
    try {
      setSaving(true);

      const prefs: UserPreferences = {
        themeMode: user?.preferences?.themeMode ?? "system",
        notificationsEnabled:
          user?.preferences?.notificationsEnabled ?? true,
        dailyReminderTime: user?.preferences?.dailyReminderTime,
      };

      await patchUser({
        name,
        email,
        avatar,
        preferences: prefs,
      });

      Alert.alert("✅ Sucesso", "Perfil atualizado com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
      }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        Editar Perfil
      </Text>

      {/* Avatar */}
      <View style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 8,
              }}
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.surface,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: theme.colors.textSecondary, fontSize: 36 }}>
                👤
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={{ color: theme.colors.textSecondary }}>
          Toque para alterar foto
        </Text>
      </View>

      {/* Nome */}
      <View style={{ marginBottom: theme.spacing.md }}>
        <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      </View>

      {/* Email */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={{ color: theme.colors.text, marginBottom: 4 }}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Seu e-mail"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        />
      </View>

      {/* Botão de salvar */}
      <Button
        title={saving ? "Salvando..." : "Salvar alterações"}
        onPress={handleSave}
        disabled={saving}
        loading={saving}
      />
    </ScrollView>
  );
}

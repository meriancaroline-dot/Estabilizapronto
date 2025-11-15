import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/Button";
import { useUser } from "@/hooks/useUser";
import { AppUser, UserPreferences } from "@/types/models";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user, patchUser } = useUser();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");

  // NOVOS CAMPOS
  const [gender, setGender] = useState<AppUser["gender"]>(
    user?.gender ?? undefined
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    user?.emergencyContactName ?? ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    user?.emergencyContactPhone ?? ""
  );
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(
    user?.emergencyContactRelation ?? ""
  );

  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
    try {
      setSaving(true);

      const prefs: UserPreferences =
        user?.preferences ?? {
          themeMode: "system",
          notificationsEnabled: true,
        };

      await patchUser({
        name,
        email,
        avatar,
        gender,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        preferences: prefs,
      });

      Alert.alert("Sucesso", "Perfil atualizado!");
    } catch (e) {
      console.error("Erro ao salvar perfil:", e);
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
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
                <Text
                  style={{ color: theme.colors.textSecondary, fontSize: 36 }}
                >
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
          <Text style={{ color: theme.colors.text, marginBottom: 4 }}>
            E-mail
          </Text>
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

        {/* Sexo */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
            Como prefere ser tratada(o)?
          </Text>

          {[
            { label: "Feminino", value: "female" },
            { label: "Masculino", value: "male" },
            { label: "Não-binário", value: "non_binary" },
            { label: "Outro", value: "other" },
            { label: "Prefere não informar", value: "prefer_not_to_say" },
          ].map((g) => (
            <TouchableOpacity
              key={g.value}
              style={{
                padding: 12,
                borderRadius: theme.borderRadius.md,
                backgroundColor:
                  gender === g.value
                    ? theme.colors.primary + "22"
                    : theme.colors.surface,
                borderWidth: 1,
                borderColor:
                  gender === g.value
                    ? theme.colors.primary
                    : theme.colors.border,
                marginBottom: 8,
              }}
              onPress={() => setGender(g.value as AppUser["gender"])}
            >
              <Text
                style={{
                  color:
                    gender === g.value
                      ? theme.colors.primary
                      : theme.colors.text,
                  fontWeight: "600",
                }}
              >
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contato de emergência */}
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          Contato de Emergência
        </Text>

        <TextInput
          value={emergencyContactName}
          onChangeText={setEmergencyContactName}
          placeholder="Nome do contato"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: 12,
          }}
        />

        <TextInput
          value={emergencyContactRelation}
          onChangeText={setEmergencyContactRelation}
          placeholder="Relação (ex: mãe, amigo...)"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: 12,
          }}
        />

        <TextInput
          value={emergencyContactPhone}
          onChangeText={setEmergencyContactPhone}
          placeholder="Telefone"
          keyboardType="phone-pad"
          placeholderTextColor={theme.colors.textSecondary}
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: 20,
          }}
        />

        {/* Salvar */}
        <Button
          title={saving ? "Salvando..." : "Salvar alterações"}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

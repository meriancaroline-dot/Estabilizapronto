// src/screens/ProfileScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useUser } from "@/contexts/UserContext";
import { useAchievements } from "@/contexts/AchievementsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

type ThemeMode = "light" | "dark" | "system";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, logout } = useUser();
  const { achievements, getUnlocked, getLocked } = useAchievements();
  const { settings, updateSettings } = useSettings();
  const navigation = useNavigation<any>();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [themePopupVisible, setThemePopupVisible] = useState(false);
  const [tab, setTab] = useState<"achievements" | "missions">("achievements");

  const unlocked = getUnlocked();
  const locked = getLocked();

  // Nívelzinho simples: 1 nível a cada 3 conquistas desbloqueadas
  const level = Math.max(1, Math.floor(unlocked.length / 3) + 1);
  const totalForNext = level * 3;
  const progressToNext =
    totalForNext === 0
      ? 0
      : Math.min(100, Math.round((unlocked.length / totalForNext) * 100));

  // Missões estáticas por enquanto (só pra explicar pro usuário)
  const missions = [
    {
      id: "m1",
      title: "Semana estável",
      description: "Complete ao menos 5 hábitos em uma semana.",
      hint: "Acompanhe na tela de Hábitos.",
    },
    {
      id: "m2",
      title: "Humor atento",
      description: "Registre seu humor em 3 períodos no mesmo dia.",
      hint: "Use a tela de Humor.",
    },
    {
      id: "m3",
      title: "Dia organizado",
      description: "Conclua 3 tarefas em um único dia.",
      hint: "Gerencie suas tarefas em Tarefas & Lembretes.",
    },
  ];

  const currentThemeMode = settings.theme as ThemeMode;

  const handleThemeChange = async (mode: ThemeMode) => {
    await updateSettings({ theme: mode });
    setThemePopupVisible(false);
  };

  const handleLogoutPress = () => {
    logout();
  };

  const handleEditProfile = () => {
    // mantém sua navegação atual
    navigation.navigate("EditProfile");
  };

  const handleGoToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho: avatar + nome + botão popup de tema */}
        <View style={styles.headerRow}>
          <View style={styles.avatarBlock}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() ?? "E"}
                </Text>
              </View>
            )}

            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={styles.editProfileText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name ?? "Usuário"}</Text>
            <Text style={styles.userEmail}>{user?.email ?? ""}</Text>

            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Ionicons name="sparkles-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.levelText}>Nível {level}</Text>
              </View>
              <Text style={styles.levelSub}>
                {unlocked.length} conquistas • {progressToNext}% até o próximo nível
              </Text>

              <View style={styles.levelBar}>
                <View
                  style={[
                    styles.levelBarFill,
                    { width: `${progressToNext}%`, backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Botãozinho redondo de tema */}
          <View style={styles.themeButtonWrapper}>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => setThemePopupVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={
                  currentThemeMode === "dark"
                    ? "moon"
                    : currentThemeMode === "light"
                    ? "sunny"
                    : "contrast-outline"
                }
                size={18}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botões de navegação rápida */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, { borderColor: theme.colors.border }]}
            onPress={handleGoToSettings}
          >
            <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
            <Text style={styles.quickButtonText}>Configurações</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs: Conquistas / Missões */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "achievements" && {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTab("achievements")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "achievements" && { color: theme.colors.primary, fontWeight: "700" },
              ]}
            >
              Conquistas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "missions" && {
                backgroundColor: theme.colors.primary + "15",
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setTab("missions")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "missions" && { color: theme.colors.primary, fontWeight: "700" },
              ]}
            >
              Missões
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo da aba */}
        {tab === "achievements" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Suas medalhas</Text>
            {achievements.length === 0 ? (
              <Text style={styles.emptyText}>
                Nada por aqui ainda. Ao completar hábitos, tarefas e registros,
                novas medalhas vão aparecer aqui. 🏅
              </Text>
            ) : (
              <View style={styles.medalsGrid}>
                {achievements.map((a) => {
                  const isUnlocked = Boolean(a.unlockedAt);
                  return (
                    <View
                      key={a.id}
                      style={[
                        styles.medalCard,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.surface,
                          opacity: isUnlocked ? 1 : 0.4,
                        },
                      ]}
                    >
                      <Text style={styles.medalIcon}>{a.icon || "🏆"}</Text>
                      <Text style={styles.medalTitle} numberOfLines={2}>
                        {a.title}
                      </Text>
                      <View style={styles.medalProgressRow}>
                        <View style={styles.medalProgressBar}>
                          <View
                            style={[
                              styles.medalProgressFill,
                              {
                                backgroundColor: theme.colors.primary,
                                width: `${a.progress ?? 0}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.medalProgressText}>
                          {Math.round(a.progress ?? 0)}%
                        </Text>
                      </View>
                      <Text style={styles.medalStatusText}>
                        {isUnlocked
                          ? "Desbloqueada"
                          : "Em progresso"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Missões em andamento</Text>
            <Text style={styles.sectionSubtitle}>
              As missões guiam o seu uso do app: quanto mais você registra e
              conclui, mais estável e previsível fica a sua rotina.
            </Text>

            {missions.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.missionCard,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
                ]}
              >
                <View style={styles.missionHeader}>
                  <Ionicons name="flag-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.missionTitle}>{m.title}</Text>
                </View>
                <Text style={styles.missionDesc}>{m.description}</Text>
                <Text style={styles.missionHint}>{m.hint}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Botão de sair discreto no fim */}
        <View style={styles.footerSpace}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            style={[styles.logoutButton, { borderColor: theme.colors.border }]}
          >
            <Ionicons name="log-out-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Popup de tema */}
      <Modal
        visible={themePopupVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemePopupVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setThemePopupVisible(false)}>
          <View style={styles.themeModalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.themeModalCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={styles.themeModalTitle}>Aparência</Text>
                <Text style={styles.themeModalSubtitle}>
                  Escolha como o Estabiliza acompanha o tema do seu aparelho.
                </Text>

                <View style={styles.themeOptionsRow}>
                  <ThemeOption
                    label="Claro"
                    icon="sunny"
                    selected={currentThemeMode === "light"}
                    onPress={() => handleThemeChange("light")}
                  />
                  <ThemeOption
                    label="Sistema"
                    icon="contrast-outline"
                    selected={currentThemeMode === "system"}
                    onPress={() => handleThemeChange("system")}
                  />
                  <ThemeOption
                    label="Escuro"
                    icon="moon"
                    selected={currentThemeMode === "dark"}
                    onPress={() => handleThemeChange("dark")}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ---------------------
// Sub-componente ThemeOption
// ---------------------
type ThemeOptionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
};

function ThemeOption({ label, icon, selected, onPress }: ThemeOptionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        themeOptionStyles.option,
        selected && themeOptionStyles.optionSelected,
      ]}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={selected ? "#fff" : "#555"}
      />
      <Text
        style={[
          themeOptionStyles.optionText,
          selected && themeOptionStyles.optionTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const themeOptionStyles = StyleSheet.create({
  option: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
  },
  optionSelected: {
    backgroundColor: "#444",
    borderColor: "#444",
  },
  optionText: {
    fontSize: 13,
    color: "#555",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});

// ---------------------
// Estilos
// ---------------------
const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 56,
      paddingBottom: 40,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    avatarBlock: {
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
    },
    avatarPlaceholder: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    avatarInitial: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.colors.text,
    },
    editProfileText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    headerInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    userEmail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    levelRow: {
      marginTop: 4,
    },
    levelBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
    },
    levelText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: "600",
    },
    levelSub: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    levelBar: {
      marginTop: 6,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      overflow: "hidden",
    },
    levelBarFill: {
      height: "100%",
      borderRadius: 999,
    },
    themeButtonWrapper: {
      marginLeft: 8,
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    themeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    quickActions: {
      flexDirection: "row",
      gap: 10,
      marginBottom: theme.spacing.lg,
    },
    quickButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
    },
    quickButtonText: {
      fontSize: 13,
      color: theme.colors.text,
    },
    tabsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    tabButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingVertical: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    tabText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    card: {
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    medalsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 8,
    },
    medalCard: {
      width: "47%",
      borderRadius: 14,
      borderWidth: 1,
      padding: 10,
    },
    medalIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    medalTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    medalProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    medalProgressBar: {
      flex: 1,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },
    medalProgressFill: {
      height: "100%",
      borderRadius: 999,
    },
    medalProgressText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      minWidth: 32,
      textAlign: "right",
    },
    medalStatusText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    missionCard: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 10,
      marginBottom: 8,
    },
    missionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    missionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    missionDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    missionHint: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
      fontStyle: "italic",
    },
    footerSpace: {
      marginTop: 24,
      marginBottom: 16,
      alignItems: "center",
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    logoutText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    themeModalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: 70,
      paddingRight: 20,
    },
    themeModalCard: {
      width: 240,
      borderRadius: 16,
      borderWidth: 1,
      padding: 12,
    },
    themeModalTitle: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
      color: theme.colors.text,
    },
    themeModalSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 10,
    },
    themeOptionsRow: {
      flexDirection: "row",
      gap: 8,
    },
  });

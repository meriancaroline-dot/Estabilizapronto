// -------------------------------------------------------------
// src/screens/ProfileScreen.tsx
// -------------------------------------------------------------
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

import { useMissions } from "@/contexts/MissionsContext";
import { CollapsibleMissionCard } from "@/components/CollapsibleMissionCard";

type ThemeMode = "light" | "dark" | "system";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, logout } = useUser();
  const { achievements, getUnlocked, getLocked } = useAchievements();
  const { settings, updateSettings } = useSettings();
  const navigation = useNavigation<any>();
  const { activeMissions } = useMissions();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [themePopupVisible, setThemePopupVisible] = useState(false);
  const [tab, setTab] = useState<"achievements" | "missions">("achievements");

  const unlocked = getUnlocked();
  getLocked(); // mantido caso queira usar depois, mas não exibimos por enquanto

  // 🎯 separa conquistas
  const uniqueUnlocked = unlocked.filter((a) => !a.isMeta);
  const collectorUnlocked = unlocked.filter((a) => a.isMeta);

  // nível
  const level = Math.max(1, Math.floor(uniqueUnlocked.length / 3) + 1);
  const totalForNext = level * 3;
  const progressToNext =
    totalForNext === 0
      ? 0
      : Math.min(
          100,
          Math.round((uniqueUnlocked.length / totalForNext) * 100)
        );

  const levelSubtitle =
    collectorUnlocked.length > 0
      ? `${uniqueUnlocked.length} conquistas únicas • ${collectorUnlocked.length} de coleção • ${progressToNext}% até o próximo nível`
      : `${uniqueUnlocked.length} conquistas • ${progressToNext}% até o próximo nível`;

  const currentThemeMode = settings.theme as ThemeMode;

  const handleThemeChange = async (mode: ThemeMode) => {
    await updateSettings({ theme: mode });
    setThemePopupVisible(false);
  };

  const handleLogoutPress = () => logout();
  const handleEditProfile = () => navigation.navigate("EditProfile");
  const handleGoToSettings = () => navigation.navigate("Settings");

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD PRINCIPAL DO PERFIL */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            {/* Avatar + editar */}
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

            {/* Nome, email, nível */}
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    {user?.name ?? "Usuário"}
                  </Text>
                  {user?.email ? (
                    <Text style={styles.userEmail}>{user.email}</Text>
                  ) : null}
                </View>

                {/* Botão tema no canto do card */}
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

              {/* Nível + barra */}
              <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                  <Ionicons
                    name="sparkles-outline"
                    size={14}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.levelText}>Nível {level}</Text>
                </View>
                <Text style={styles.levelSub}>{levelSubtitle}</Text>

                <View style={styles.levelBar}>
                  <View
                    style={[
                      styles.levelBarFill,
                      {
                        width: `${progressToNext}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Ações rápidas dentro do card */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickButton,
                { borderColor: theme.colors.border },
              ]}
              onPress={handleGoToSettings}
            >
              <Ionicons
                name="settings-outline"
                size={18}
                color={theme.colors.text}
              />
              <Text style={styles.quickButtonText}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TABS (Conquistas / Missões) */}
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
                tab === "achievements" && {
                  color: theme.colors.primary,
                  fontWeight: "700",
                },
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
                tab === "missions" && {
                  color: theme.colors.primary,
                  fontWeight: "700",
                },
              ]}
            >
              Missões
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONQUISTAS */}
        {tab === "achievements" ? (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="trophy-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Suas medalhas</Text>
              </View>
              {achievements.length > 0 && (
                <Text style={styles.sectionCounter}>
                  {uniqueUnlocked.length} desbloqueadas
                </Text>
              )}
            </View>

            {achievements.length === 0 ? (
              <Text style={styles.emptyText}>
                Nada por aqui ainda. Conforme você usa o app, medalhas vão
                aparecer aqui. 🏅
              </Text>
            ) : (
              <View style={styles.medalsGrid}>
                {achievements.map((a) => {
                  const isUnlocked = Boolean(a.unlockedAt);
                  const isMeta = Boolean(a.isMeta);

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

                      {isMeta && (
                        <View style={styles.medalTag}>
                          <Text style={styles.medalTagText}>Coleção</Text>
                        </View>
                      )}

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
                        {isUnlocked ? "Desbloqueada" : "Em progresso"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          // MISSÕES AUTO-ATUALIZÁVEIS
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="flag-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Missões em andamento</Text>
              </View>
            </View>

            <Text style={styles.sectionSubtitle}>
              Elas se ajustam automaticamente conforme você usa o Estabiliza.
            </Text>

            {activeMissions.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma missão ativa no momento. Continue usando o app que novas
                missões vão aparecer por aqui. ✨
              </Text>
            ) : (
              activeMissions.map((m) => (
                <CollapsibleMissionCard
                  key={m.id}
                  title={`${m.title} (${m.progress}%)`}
                  description={m.description}
                  hint={`Meta atual: ${m.target}`}
                />
              ))
            )}
          </View>
        )}

        {/* Logout */}
        <View style={styles.footerSpace}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            style={[styles.logoutButton, { borderColor: theme.colors.border }]}
          >
            <Ionicons
              name="log-out-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
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
        <TouchableWithoutFeedback
          onPress={() => setThemePopupVisible(false)}
        >
          <View style={styles.themeModalBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.themeModalCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
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

// ------------------------------------------------------------------
// Subcomponent: ThemeOption
// ------------------------------------------------------------------
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
      <Ionicons name={icon} size={18} color={selected ? "#fff" : "#555"} />
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

// ------------------------------------------------------------------
// Estilos
// ------------------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 40,
      paddingBottom: 180,
    },

    // CARD DO PERFIL
    profileCard: {
      borderRadius: theme.borderRadius.xl ?? theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    profileTopRow: {
      flexDirection: "row",
      alignItems: "center",
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
    nameRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    userName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    userEmail: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    themeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      marginLeft: 8,
    },

    // Level
    levelRow: {
      marginTop: 4,
    },
    levelBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.background,
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
      marginTop: 8,
      height: 6,
      borderRadius: 999,
      backgroundColor: theme.colors.background,
      overflow: "hidden",
    },
    levelBarFill: {
      height: "100%",
      borderRadius: 999,
    },

    // Quick actions dentro do card
    quickActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: theme.spacing.md,
    },
    quickButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
    },
    quickButtonText: {
      fontSize: 13,
      color: theme.colors.text,
    },

    // Tabs
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
      backgroundColor: theme.colors.surface,
    },
    tabText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    // Cards gerais (conquistas / missões)
    card: {
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    sectionCounter: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 10,
      marginTop: 2,
    },
    emptyText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },

    // Medalhas
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
      marginBottom: 2,
    },
    medalTag: {
      alignSelf: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      backgroundColor: theme.colors.primary + "20",
      marginBottom: 4,
    },
    medalTagText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: "600",
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

    // Missões
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

    // Footer
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
      backgroundColor: theme.colors.surface,
    },
    logoutText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    // Modal de tema
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

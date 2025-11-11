import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useHabits } from "@/hooks/useHabits";
import { Habit } from "@/types/models";
import { useWellness } from "@/contexts/WellnessContext";

export default function HabitsScreen() {
  const { theme } = useTheme();
  const { habits, addHabit, updateHabit, deleteHabit, completeHabit, resetStreak } = useHabits();
  const { state } = useWellness();

  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Habit["frequency"]>("daily");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setFrequency("daily");
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (h: Habit) => {
    setEditingId(h.id);
    setTitle(h.title);
    setDescription(h.description ?? "");
    setFrequency(h.frequency ?? "daily");
    setVisible(true);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "O título do hábito é obrigatório.");
      return;
    }

    try {
      if (editingId) {
        await updateHabit(editingId, {
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addHabit({
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
            createdAt: new Date().toISOString(), // ✅ adicionado campo obrigatório
        });
      }
      setVisible(false);
      resetForm();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o hábito.");
    }
  };

  const fadeCard = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const onComplete = async (h: Habit) => {
    try {
      await completeHabit(h.id);
      fadeCard();
    } catch {
      Alert.alert("Erro", "Falha ao completar o hábito.");
    }
  };

  const onReset = async (h: Habit) => {
    try {
      await resetStreak(h.id);
    } catch {
      Alert.alert("Erro", "Falha ao resetar a sequência.");
    }
  };

  const onDelete = (id: string) => {
    Alert.alert("Excluir", "Deseja excluir este hábito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHabit(id);
          } catch {
            Alert.alert("Erro", "Falha ao excluir o hábito.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Habit }) => {
    const last = item.lastCompleted ? formatDate(item.lastCompleted) : "—";

    return (
      <Animated.View
        style={[
          styles.item,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: fadeAnim },
        ]}
      >
        <View style={styles.itemTopRow}>
          <View style={styles.itemLeft}>
            <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{item.title}</Text>
            {!!item.description && (
              <Text style={[styles.itemDesc, { color: theme.colors.textSecondary }]}>
                {item.description}
              </Text>
            )}
          </View>

          <View style={styles.streakPill}>
            <Text style={[styles.streakLabel, { color: theme.colors.primary }]}>🔥 {item.streak ?? 0}</Text>
          </View>
        </View>

        <Text style={[styles.itemMeta, { color: theme.colors.textSecondary }]}>
          Freq.: {ptFrequency(item.frequency ?? "daily")} • Último: <Text style={styles.bold}>{last}</Text>
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={() => onComplete(item)} style={[styles.actionChip, styles.chipPrimary]}>
            <Text style={styles.chipPrimaryText}>Concluir</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onReset(item)} style={[styles.actionChip, styles.chipNeutral]}>
            <Text style={styles.chipText}>Resetar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionChip, styles.chipOutline]}>
            <Text style={styles.chipText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.actionChip, styles.chipDanger]}>
            <Text style={styles.chipDangerText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Hábitos</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Pequenos passos, grandes mudanças
          </Text>
        </View>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={habits}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 260 },
          habits.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Você ainda não tem hábitos. Crie um agora e bora manter a sequência 💪
          </Text>
        }
      />

      {/* MODAL */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingId ? "Editar hábito" : "Novo hábito"}
            </Text>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Beber água"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Frequência</Text>
            <View style={styles.chipsRow}>
              {(["daily", "weekly", "monthly", "custom"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFrequency(opt)}
                  style={[
                    styles.chip,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor:
                        frequency === opt
                          ? theme.colors.primary + "22"
                          : theme.colors.background,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        frequency === opt
                          ? theme.colors.primary
                          : theme.colors.textSecondary,
                      fontWeight: frequency === opt ? "700" : "400",
                    }}
                  >
                    {ptFrequency(opt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setVisible(false);
                  resetForm();
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={styles.btnGhostTxt}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSave} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryTxt}>{editingId ? "Salvar" : "Criar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ptFrequency(f: Habit["frequency"]) {
  switch (f) {
    case "daily":
      return "Diária";
    case "weekly":
      return "Semanal";
    case "monthly":
      return "Mensal";
    case "custom":
      return "Custom";
    default:
      return "Diária";
  }
}

function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 20 : 60,
      paddingBottom: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: { fontSize: 22, fontWeight: "700" },
    subtitle: { marginTop: 4, fontSize: 13 },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    listContent: { paddingHorizontal: theme.spacing.lg },
    separator: { height: 10 },
    emptyContainer: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    emptyText: { fontSize: 14, textAlign: "center" },
    item: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    itemTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    itemLeft: { flex: 1, marginRight: theme.spacing.sm },
    itemTitle: { fontSize: 16, fontWeight: "600" },
    itemDesc: { fontSize: 13, marginTop: 2 },
    itemMeta: { fontSize: 12, marginTop: 4 },
    bold: { fontWeight: "700" },
    streakPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: theme.colors.primary + "12",
      alignSelf: "flex-start",
    },
    streakLabel: { fontSize: 12, fontWeight: "600" },
    actionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: theme.spacing.sm,
    },
    actionChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    chipText: { fontSize: 12, fontWeight: "600", color: theme.colors.text },
    chipPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipPrimaryText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    chipNeutral: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
    chipOutline: { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
    chipDanger: { backgroundColor: theme.colors.background, borderColor: theme.colors.danger },
    chipDangerText: { fontSize: 12, fontWeight: "600", color: theme.colors.danger },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    modalCard: {
      width: "100%",
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      borderWidth: 1,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: theme.spacing.md },
    label: { marginTop: theme.spacing.sm, marginBottom: 4, fontSize: 13 },
    input: {
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
    },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
    chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
      marginTop: theme.spacing.lg,
    },
    btn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    btnGhost: { backgroundColor: theme.colors.background },
    btnGhostTxt: { fontWeight: "700", color: theme.colors.textSecondary },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    btnPrimaryTxt: { color: "#fff", fontWeight: "700" },
  });

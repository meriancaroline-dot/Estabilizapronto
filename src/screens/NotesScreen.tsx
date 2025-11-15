import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useNotes } from "@/hooks/useNotes";
import { Note } from "@/types/models";
import { gamification } from "@/gamification/GamificationEngine"; // 🔥 GATILHO DE MISSÃO

const { width } = Dimensions.get("window");

export default function NotesScreen() {
  const { theme } = useTheme();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const colors = theme.colors;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    try {
      if (editingId) {
        await updateNote(editingId, {
          title: trimmedTitle || "Sem título",
          content: trimmedContent,
        });
        Alert.alert("✅ Atualizado", "A nota foi atualizada.");
      } else {
        await addNote({
          title: trimmedTitle || "Sem título",
          content: trimmedContent,
        });

        // 🔥 conta para a missão "Mente ativa"
        await gamification.registerEvent("note_created");

        Alert.alert("📝 Salvo", "Nova nota adicionada.");
      }
      setTitle("");
      setContent("");
      setEditingId(null);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir nota", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(id);
          } catch {
            Alert.alert("Erro", "Falha ao excluir.");
          }
        },
      },
    ]);
  };

  const colorsPalette = ["#FFF5C4", "#FFE0E9", "#DFFFE0", "#DFF4FF", "#FDE9C9"];

  const renderNote = ({ item }: { item: Note }) => {
    const bg = colorsPalette[Math.floor(Math.random() * colorsPalette.length)];
    const rotation = Math.random() * 6 - 3;

    return (
      <Animated.View
        style={[
          styles.noteCard,
          {
            backgroundColor: bg,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={{ flex: 1 }}
          activeOpacity={0.8}
        >
          <Text style={[styles.noteTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text
            style={[styles.noteContent, { color: colors.textSecondary }]}
            numberOfLines={6}
          >
            {item.content}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="close" size={16} color="#333" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Minhas Notas
            </Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Um espaço para soltar os pensamentos
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="pencil-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {editingId ? "Editar nota" : "Nova nota"}
              </Text>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título da nota"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Escreva aqui..."
              placeholderTextColor={colors.textSecondary}
              multiline
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFF"
              />
              <Text style={styles.saveButtonText}>
                {editingId ? "Atualizar" : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mural}>
            <FlatList
              data={[...notes].reverse()}
              keyExtractor={(item) => item.id}
              renderItem={renderNote}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
            />
          </View>

          {notes.length === 0 && (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Nenhuma nota ainda
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Comece escrevendo sua primeira nota acima
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginTop: 56,
    marginBottom: 26,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "600",
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
  },
  card: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  mural: {
    flex: 1,
    marginTop: 8,
    gap: 12,
  },
  noteCard: {
    width: (width - 60) / 2,
    minHeight: 120,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  noteTitle: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#ffffffaa",
    borderRadius: 50,
    padding: 4,
  },
  emptyState: {
    borderRadius: CARD_RADIUS,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

// src/screens/AchievementsScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
// ✅ CORREÇÃO: Importar o hook e o tipo do CONTEXTO
import { useAchievements, Achievement } from '@/contexts/AchievementsContext';

export default function AchievementsScreen() {
  const { theme } = useTheme();
  // ✅ CORREÇÃO: Hooks vêm do AchievementsContext
  const { achievements, addAchievement, updateAchievement, deleteAchievement } =
    useAchievements();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏅');
  const [progress, setProgress] = useState(0); // ✅ ADICIONADO: O contexto precisa de 'progress'

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setIcon('🏅');
    setProgress(0);
  };

  const openCreate = () => {
    resetForm();
    setVisible(true);
  };

  const openEdit = (a: Achievement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setDescription(a.description ?? '');
    setIcon(a.icon ?? '🏅');
    setProgress(a.progress ?? 0); // ✅ ADICIONADO: Editar progresso
    setVisible(true);
  };

  // -----------------------------------------------------------
  // ✅ CORREÇÃO: Criar ou atualizar conquista usando o formato do Contexto
  // -----------------------------------------------------------
  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo obrigatório', 'O título é obrigatório.');
      return;
    }
    try {
      const dataToSave = {
        title: title.trim(),
        description: description.trim() || undefined,
        icon: icon || '🏅',
        progress: progress, // O contexto espera 'progress'
        userId: 'default_user', // O contexto espera 'userId'
      };

      if (editingId) {
        await updateAchievement(editingId, dataToSave);
      } else {
        // @ts-ignore - O tipo Omit do addAchievement está a ser chato, mas os dados estão corretos
        await addAchievement(dataToSave);
      }
      setVisible(false);
      resetForm();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a conquista.');
    }
  };

  const onDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir esta conquista?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAchievement(id);
          } catch {
            Alert.alert('Erro', 'Falha ao excluir a conquista.');
          }
        },
      },
    ]);
  };

  // ✅ CORREÇÃO: Render item para usar 'unlockedAt' em vez de 'unlocked' e 'date'
  const renderItem = ({ item }: { item: Achievement }) => (
    <View
      style={[
        styles.item,
        !item.unlockedAt && { opacity: 0.5 }, // Verifica 'unlockedAt'
      ]}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{item.icon ?? '🏆'}</Text>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {!!item.description && (
            <Text style={styles.itemDesc}>{item.description}</Text>
          )}
          <Text style={styles.itemDate}>
            {item.unlockedAt // Usa 'unlockedAt'
              ? `Desbloqueado em ${formatDate(item.unlockedAt)}`
              : 'Bloqueado'}
          </Text>
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => openEdit(item)}
          style={[styles.actionBtn, styles.outline]}
        >
          <Text style={styles.actionTxt}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={[styles.actionBtn, styles.danger]}
        >
          <Text style={styles.actionTxt}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conquistas</Text>
        <TouchableOpacity onPress={openCreate} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={achievements}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={
          achievements.length === 0 && styles.emptyContainer
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhuma conquista ainda. Continue avançando para desbloquear! 🏅
          </Text>
        }
      />

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Editar conquista' : 'Nova conquista'}
            </Text>

            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: 7 dias seguidos!"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <Text style={styles.label}>Ícone (emoji)</Text>
            <TextInput
              value={icon}
              onChangeText={setIcon}
              placeholder="🏅"
              maxLength={2}
              style={styles.input}
            />

            {/* ✅ ADICIONADO: Campo de progresso */}
            <Text style={styles.label}>Progresso (0-100)</Text>
            <TextInput
              value={String(progress)}
              onChangeText={(text) => setProgress(Number(text.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
              maxLength={3}
              style={styles.input}
            />


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

              <TouchableOpacity
                onPress={onSave}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={styles.btnPrimaryTxt}>
                  {editingId ? 'Salvar' : 'Criar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function formatDate(iso: string) {
  try {
    const datePart = iso.split('T')[0];
    const [y, m, d] = datePart.split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

// -----------------------------------------------------------
// Estilos
// -----------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.lg,
    },
    emptyContainer: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1, // Ocupa o espaço disponível
    },
    itemContent: {
      flex: 1, // Permite que o texto quebre a linha se necessário
    },
    itemIcon: {
      fontSize: 28,
      marginRight: 4, // Ligeiro ajuste
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    itemDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    itemDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    itemActions: {
      gap: 6,
      alignItems: 'flex-end',
      marginLeft: 8, // Garante espaço entre o texto e os botões
    },
    actionBtn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    actionTxt: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '600',
    },
    outline: {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    danger: {
      borderColor: theme.colors.danger,
      backgroundColor: theme.colors.background,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    label: {
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: 4,
      fontSize: 13,
    },
    input: {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 10,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: theme.spacing.lg,
    },
    btn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    btnGhost: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.border,
    },
    btnGhostTxt: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
    btnPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    btnPrimaryTxt: {
      color: '#fff',
      fontWeight: '700',
    },
  });
// src/screens/TasksAndRemindersScreen.tsx
// -------------------------------------------------------------
// Tarefas & Lembretes
// - Dois blocos separados (Tarefas / Lembretes)
// - Design no padrão da Dash (cards limpos, surface + border)
// - Lógica de notificação via useReminders/NotificationContext
// -------------------------------------------------------------
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/hooks/useTasks';
import { useReminders } from '@/hooks/useReminders';
import { Task, Reminder } from '@/types/models';

export default function TasksAndRemindersScreen() {
  const { theme } = useTheme();
  const { tasks, addTask, deleteTask } = useTasks();
  const { reminders, addReminder, updateReminder, deleteReminder } = useReminders();

  const styles = useMemo(() => createStyles(theme), [theme]);

  // -----------------------------------------------------------
  // 📌 Tarefas
  // -----------------------------------------------------------
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  // -----------------------------------------------------------
  // ⏰ Lembretes
  // -----------------------------------------------------------
  const [remModalVisible, setRemModalVisible] = useState(false);
  const [editingRemId, setEditingRemId] = useState<string | null>(null);
  const [remTitle, setRemTitle] = useState('');
  const [remDescription, setRemDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [remRepeat, setRemRepeat] = useState<Reminder['repeat']>('none');

  // -----------------------------------------------------------
  // 💾 Salvar lembrete (criar / editar)
  // -----------------------------------------------------------
  const onSaveReminder = async () => {
    if (!remTitle.trim()) {
      Alert.alert('Campo obrigatório', 'Título é obrigatório.');
      return;
    }

    const now = new Date();
    if (remRepeat === 'none' && selectedDate <= now) {
      Alert.alert('Data inválida', 'A data do lembrete deve ser no futuro.');
      return;
    }

    try {
      const payloadBase = {
        title: remTitle.trim(),
        description: remDescription.trim() || undefined,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedDate.toTimeString().slice(0, 5),
        repeat: remRepeat ?? 'none',
        userId: undefined,
      } satisfies Omit<
        Reminder,
        'id' | 'isCompleted' | 'createdAt' | 'updatedAt' | 'notificationId'
      >;

      if (editingRemId) {
        await updateReminder(editingRemId, payloadBase);
      } else {
        await addReminder(payloadBase);
      }

      setRemModalVisible(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      setEditingRemId(null);
      setRemTitle('');
      setRemDescription('');
      setRemRepeat('none');
      setSelectedDate(new Date());

      Alert.alert('✅ Lembrete salvo', 'Notificação agendada com sucesso!');
    } catch (e) {
      console.error('Erro ao salvar lembrete:', e);
      Alert.alert('Erro', 'Falha ao salvar lembrete.');
    }
  };

  // -----------------------------------------------------------
  // Editar lembrete existente (abre modal preenchido)
// -----------------------------------------------------------
  const openEditReminder = (rem: Reminder) => {
    setEditingRemId(rem.id);
    setRemTitle(rem.title);
    setRemDescription(rem.description ?? '');
    const [year, month, day] = rem.date.split('-').map(Number);
    const [hour, minute] = rem.time.split(':').map(Number);
    const d = new Date();
    d.setFullYear(year, (month ?? 1) - 1, day ?? 1);
    d.setHours(hour ?? 0, minute ?? 0, 0, 0);
    setSelectedDate(d);
    setRemRepeat(rem.repeat ?? 'none');
    setRemModalVisible(true);
  };

  // -----------------------------------------------------------
  // 🗑️ Excluir lembrete
  // -----------------------------------------------------------
  const onDeleteReminder = (id: string) => {
    Alert.alert('Excluir', 'Deseja realmente excluir este lembrete?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReminder(id);
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao excluir o lembrete.');
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // 📝 Salvar tarefa
  // -----------------------------------------------------------
  const onSaveTask = async () => {
    const title = taskTitle.trim();
    if (!title) {
      Alert.alert('Campo obrigatório', 'Título da tarefa é obrigatório.');
      return;
    }

    const payload: Omit<Task, 'id' | 'createdAt' | 'completed'> = {
      title,
      description: taskDescription.trim() || undefined,
      dueDate: undefined,
      priority: undefined,
      tags: undefined,
      userId: undefined,
      updatedAt: undefined,
    };

    try {
      await addTask(payload as any);
      setTaskTitle('');
      setTaskDescription('');
      setTaskModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao salvar tarefa.');
    }
  };

  const onDeleteTask = (id: string) => {
    Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(id);
          } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao excluir tarefa.');
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------
  // DateTimePicker handlers
  // -----------------------------------------------------------
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    if (event.type === 'set' && date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear());
      newDate.setMonth(date.getMonth());
      newDate.setDate(date.getDate());

      setSelectedDate(newDate);

      if (Platform.OS === 'android') {
        setTimeout(() => {
          setShowTimePicker(true);
        }, 100);
      }
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);

    if (event.type === 'set' && date) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      setSelectedDate(newDate);
    }
  };

  const openDateTimePicker = () => {
    setShowDatePicker(true);
  };

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Cabeçalho */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
          Tarefas & Lembretes
        </Text>
        <Text
          style={[styles.pageSubtitle, { color: theme.colors.textSecondary }]}
        >
          Organize seu dia com leveza
        </Text>
      </View>

      {/* Tarefas */}
      <View
        style={[
          styles.block,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.blockHeader}>
          <Text style={[styles.blockTitle, { color: theme.colors.text }]}>
            Tarefas
          </Text>
          <TouchableOpacity
            onPress={() => setTaskModalVisible(true)}
            style={[styles.btnAdd, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.btnAddText}>+ Tarefa</Text>
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
            Nenhuma tarefa ainda.
          </Text>
        ) : (
          tasks.map((t) => (
            <View
              key={t.id}
              style={[styles.row, { borderColor: theme.colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.rowTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {t.title}
                </Text>
                {t.description ? (
                  <Text
                    style={[
                      styles.rowSub,
                      { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {t.description}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity onPress={() => onDeleteTask(t.id)}>
                <Text style={{ color: theme.colors.danger }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Lembretes */}
      <View
        style={[
          styles.block,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.blockHeader}>
          <Text style={[styles.blockTitle, { color: theme.colors.text }]}>
            Lembretes
          </Text>
          <TouchableOpacity
            onPress={() => {
              setEditingRemId(null);
              setRemTitle('');
              setRemDescription('');
              setRemRepeat('none');
              setSelectedDate(new Date());
              setRemModalVisible(true);
            }}
            style={[styles.btnAdd, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.btnAddText}>+ Lembrete</Text>
          </TouchableOpacity>
        </View>

        {reminders.length === 0 ? (
          <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
            Nenhum lembrete ainda.
          </Text>
        ) : (
          reminders.map((r) => (
            <View
              key={r.id}
              style={[styles.row, { borderColor: theme.colors.border }]}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => openEditReminder(r)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.rowTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {r.title}
                </Text>

                {r.description ? (
                  <Text
                    style={[
                      styles.rowSub,
                      { color: theme.colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {r.description}
                  </Text>
                ) : null}

                <Text
                  style={[
                    styles.rowMeta,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {r.date} às {r.time} • {ptRepeat(r.repeat)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => onDeleteReminder(r.id)}>
                <Text style={{ color: theme.colors.danger }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* MODAL: Nova TAREFA */}
      <Modal visible={taskModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Nova tarefa
              </Text>

              <TextInput
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Título"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />
              <TextInput
                value={taskDescription}
                onChangeText={setTaskDescription}
                placeholder="Descrição (opcional)"
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setTaskModalVisible(false)}
                  style={[styles.btn, { borderColor: theme.colors.border }]}
                >
                  <Text style={{ color: theme.colors.textSecondary }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSaveTask}
                  style={[styles.btn, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: Novo / Editar LEMBRETE */}
      <Modal visible={remModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackdrop}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {editingRemId ? 'Editar lembrete' : 'Novo lembrete'}
                </Text>

                <TextInput
                  value={remTitle}
                  onChangeText={setRemTitle}
                  placeholder="Título"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />

                <TextInput
                  value={remDescription}
                  onChangeText={setRemDescription}
                  placeholder="Descrição (opcional)"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={[
                    styles.input,
                    {
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  multiline
                  numberOfLines={3}
                />

                {/* Data / Hora */}
                <TouchableOpacity
                  onPress={openDateTimePicker}
                  style={[
                    styles.input,
                    {
                      justifyContent: 'center',
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: theme.colors.text }}>
                    📅{' '}
                    {selectedDate.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </TouchableOpacity>

                {/* DateTimePicker: DATA */}
                {showDatePicker && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={selectedDate}
                      mode={Platform.OS === 'android' ? 'date' : 'datetime'}
                      is24Hour
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      minimumDate={new Date()}
                      onChange={handleDateChange}
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        style={[
                          styles.btnPickerDone,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                          Confirmar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* DateTimePicker: HORA (Android) */}
                {showTimePicker && Platform.OS === 'android' && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    is24Hour
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}

                {/* Repetição */}
                <Text
                  style={[styles.label, { color: theme.colors.textSecondary }]}
                >
                  Repetição
                </Text>
                <View style={styles.chipsRow}>
                  {(['none', 'daily', 'weekly', 'monthly'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setRemRepeat(opt)}
                      style={[
                        styles.chip,
                        {
                          borderColor: theme.colors.border,
                          backgroundColor:
                            remRepeat === opt
                              ? theme.colors.primary + '22'
                              : theme.colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            remRepeat === opt
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                          fontWeight: remRepeat === opt ? '700' : '400',
                        }}
                      >
                        {ptRepeat(opt)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setRemModalVisible(false);
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                    }}
                    style={[styles.btn, { borderColor: theme.colors.border }]}
                  >
                    <Text style={{ color: theme.colors.textSecondary }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onSaveReminder}
                    style={[styles.btn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Salvar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function ptRepeat(rep: Reminder['repeat'] | undefined) {
  switch (rep) {
    case 'daily':
      return 'Diária';
    case 'weekly':
      return 'Semanal';
    case 'monthly':
      return 'Mensal';
    default:
      return 'Sem repetição';
  }
}

// -------------------------------------------------------------
// Estilos
// -------------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 56,
    },
    pageHeader: {
      marginTop: 8,
      marginBottom: 10,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '700',
    },
    pageSubtitle: {
      marginTop: 4,
      fontSize: 13,
    },

    block: {
      borderWidth: 1,
      borderRadius: 18,
      padding: 14,
      marginTop: 16,
    },
    blockHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    blockTitle: {
      fontSize: 17,
      fontWeight: '600',
    },
    btnAdd: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnAddText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    rowSub: {
      fontSize: 12,
      marginTop: 2,
    },
    rowMeta: {
      fontSize: 11,
      marginTop: 4,
    },
    empty: {
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 8,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      marginBottom: 12,
      fontSize: 14,
    },
    label: { fontSize: 13, marginBottom: 6 },
    chipsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    btn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      marginLeft: 8,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
    },
    pickerContainer: {
      marginBottom: 12,
      borderRadius: 10,
      overflow: 'hidden',
    },
    btnPickerDone: {
      padding: 12,
      alignItems: 'center',
      borderRadius: 8,
      marginTop: 8,
    },
  });

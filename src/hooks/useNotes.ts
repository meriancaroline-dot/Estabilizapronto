import { useCallback, useEffect, useState } from 'react';
import { useStorage } from './useStorage';
import { Note } from '@/types/models';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// 🚨 ADICIONADO
import { gamification } from '@/gamification/GamificationEngine';

// -------------------------------------------------------------
// Hook principal — gerenciamento de notas
// -------------------------------------------------------------
export function useNotes() {
  const {
    value: notes,
    setValue: setNotes,
    save: saveNotes,
    load: loadNotes,
  } = useStorage<Note[]>({
    key: 'notes',
    initialValue: [],
  });

  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------------
  // Carregar notas
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      await loadNotes();
      setLoading(false);
    })();
  }, [loadNotes]);

  // -----------------------------------------------------------
  // Criar nova nota
  // -----------------------------------------------------------
  const addNote = useCallback(
    async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newNote: Note = {
          ...data,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updated = [newNote, ...notes]; // nova no topo
        setNotes(updated);
        await saveNotes(updated);

        // 🚨 GAMIFICAÇÃO — SEM INVENTAR NADA
        await gamification.registerEvent("note_created");

        console.log('📝 Nota criada:', newNote.title);
      } catch (e) {
        console.error('Erro ao adicionar nota:', e);
        Alert.alert('Erro', 'Não foi possível criar a nota.');
      }
    },
    [notes, setNotes, saveNotes],
  );

  // -----------------------------------------------------------
  // Atualizar nota existente
  // -----------------------------------------------------------
  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      try {
        const updatedList = notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
        );

        setNotes(updatedList);
        await saveNotes(updatedList);

        console.log('✏️ Nota atualizada:', id);
      } catch (e) {
        console.error('Erro ao atualizar nota:', e);
        Alert.alert('Erro', 'Não foi possível atualizar a nota.');
      }
    },
    [notes, setNotes, saveNotes],
  );

  // -----------------------------------------------------------
  // Excluir nota
  // -----------------------------------------------------------
  const deleteNote = useCallback(
    async (id: string) => {
      try {
        const filtered = notes.filter((n) => n.id !== id);
        setNotes(filtered);
        await saveNotes(filtered);

        console.log('🗑️ Nota removida:', id);
      } catch (e) {
        console.error('Erro ao remover nota:', e);
        Alert.alert('Erro', 'Não foi possível remover a nota.');
      }
    },
    [notes, setNotes, saveNotes],
  );

  // -----------------------------------------------------------
  // Fixar (pinned)
  // -----------------------------------------------------------
  const togglePinned = useCallback(
    async (id: string) => {
      try {
        const updatedList = notes.map((n) =>
          n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n,
        );

        const sorted = [
          ...updatedList.filter((n) => n.pinned),
          ...updatedList.filter((n) => !n.pinned),
        ];

        setNotes(sorted);
        await saveNotes(sorted);

        console.log('📌 Nota fixada/solta:', id);
      } catch (e) {
        console.error('Erro ao fixar nota:', e);
        Alert.alert('Erro', 'Não foi possível fixar a nota.');
      }
    },
    [notes, setNotes, saveNotes],
  );

  // -----------------------------------------------------------
  // Buscar por palavra-chave
  // -----------------------------------------------------------
  const searchNotes = useCallback(
    (query: string): Note[] => {
      if (!query.trim()) return notes;
      const q = query.toLowerCase();
      return notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags?.some((tag) => tag.toLowerCase().includes(q)),
      );
    },
    [notes],
  );

  // -----------------------------------------------------------
  // Resetar todas as notas
  // -----------------------------------------------------------
  const clearNotes = useCallback(async () => {
    setNotes([]);
    await saveNotes([]);
    console.log('🧹 Todas as notas foram apagadas.');
  }, [setNotes, saveNotes]);

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    togglePinned,
    searchNotes,
    clearNotes,
  };
}

// src/screens/BackupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useBackup } from '@/hooks/useBackup';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Tipagem local leve para evitar erros de TS (igual usada em useBackup.ts)
type FSLike = {
  documentDirectory?: string | null;
  cacheDirectory?: string | null;
  writeAsStringAsync: (uri: string, data: string, opts?: { encoding?: 'utf8' | 'base64' }) => Promise<void>;
  readAsStringAsync: (uri: string, opts?: { encoding?: 'utf8' | 'base64' }) => Promise<string>;
};
const FS = FileSystem as unknown as FSLike;

// -------------------------------------------------------------
// 💾 Tela de Backup — exportar e restaurar dados
// -------------------------------------------------------------
export default function BackupScreen() {
  const { theme } = useTheme();
  const { exportData, importData, clearOldBackups, getLastBackup, loading } = useBackup();
  const styles = createStyles(theme);

  const [processing, setProcessing] = useState(false);

  // -----------------------------------------------------------
  // Exportar dados (gera JSON e permite compartilhar)
  // -----------------------------------------------------------
  const handleExport = async () => {
    try {
      setProcessing(true);
      await exportData();
      await clearOldBackups();

      const lastBackup = await getLastBackup();
      if (lastBackup) {
        const fileUri = `${FS.documentDirectory}${lastBackup}`;
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Backup criado', 'O arquivo foi salvo localmente.');
        }
      } else {
        Alert.alert('Backup concluído', 'Backup exportado, mas não encontrado no diretório.');
      }
    } catch (e) {
      console.error('Erro ao exportar backup:', e);
      Alert.alert('Erro', 'Não foi possível exportar o backup.');
    } finally {
      setProcessing(false);
    }
  };

  // -----------------------------------------------------------
  // Importar backup (ler arquivo JSON manualmente)
  // -----------------------------------------------------------
  const handleImport = async () => {
    Alert.alert(
      'Importar backup',
      'Deseja importar o último backup salvo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);

              const lastBackup = await getLastBackup();
              if (!lastBackup) {
                Alert.alert('Nenhum backup encontrado', 'Não há arquivos disponíveis.');
                return;
              }

              const fileUri = `${FS.documentDirectory}${lastBackup}`;
              const jsonString = await FS.readAsStringAsync(fileUri, { encoding: 'utf8' });

              await importData(jsonString);
              Alert.alert('✅ Sucesso', 'Backup restaurado com sucesso.');
            } catch (e) {
              console.error('Erro ao importar backup:', e);
              Alert.alert('Erro', 'Falha ao restaurar backup.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backup e Restauração</Text>
      <Text style={styles.subtitle}>
        Faça backup dos seus dados para mantê-los seguros. Você pode restaurar suas
        informações a qualquer momento.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exportar Backup</Text>
        <Text style={styles.cardText}>
          Gera um arquivo com todos os seus dados e salva localmente ou permite compartilhar.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleExport}
          disabled={processing || loading}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Exportar Dados</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Importar Backup</Text>
        <Text style={styles.cardText}>
          Restaura seus dados a partir do último backup salvo no dispositivo.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleImport}
          disabled={processing || loading}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Importar Dados</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Última verificação: {new Date().toLocaleDateString()} às{' '}
        {new Date().toLocaleTimeString().slice(0, 5)}
      </Text>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// 💅 Estilos
// -------------------------------------------------------------
const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    cardText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      marginBottom: theme.spacing.md,
    },
    button: {
      paddingVertical: 12,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    dangerButton: {
      backgroundColor: theme.colors.danger,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    footerText: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
  });

// -------------------------------------------------------------
// src/screens/SettingsScreen.tsx
// -------------------------------------------------------------
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/contexts/SettingsContext';
import { ThemeMode } from '@/types/models';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { settings, updateSettings, resetSettings, loading } = useSettings();
  const colors = theme.colors;

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      try {
        await updateSettings({ theme: mode });
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível atualizar o tema.');
      }
    },
    [updateSettings],
  );

  const handleNotificationsChange = useCallback(
    async (value: boolean) => {
      try {
        await updateSettings({ notificationsEnabled: value });
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível atualizar as notificações.');
      }
    },
    [updateSettings],
  );

  const handleBackupChange = useCallback(
    async (value: boolean) => {
      try {
        await updateSettings({ backupEnabled: value });
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível atualizar o backup automático.');
      }
    },
    [updateSettings],
  );

  const handleSyncChange = useCallback(
    async (value: boolean) => {
      try {
        await updateSettings({ syncEnabled: value });
      } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Não foi possível atualizar a sincronização em nuvem.');
      }
    },
    [updateSettings],
  );

  const handleReset = useCallback(async () => {
    Alert.alert(
      'Restaurar padrões',
      'Deseja realmente restaurar as configurações padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
            } catch (e) {
              console.error(e);
              Alert.alert('Erro', 'Não foi possível restaurar as configurações.');
            }
          },
        },
      ],
    );
  }, [resetSettings]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Aparência / Tema */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Aparência</Text>
          </View>

          <View style={styles.themeRow}>
            <ThemeOption
              label="Sistema"
              icon="phone-portrait-outline"
              active={settings.theme === 'system'}
              onPress={() => handleThemeChange('system')}
              colors={colors}
            />
            <ThemeOption
              label="Claro"
              icon="sunny-outline"
              active={settings.theme === 'light'}
              onPress={() => handleThemeChange('light')}
              colors={colors}
            />
            <ThemeOption
              label="Escuro"
              icon="moon-outline"
              active={settings.theme === 'dark'}
              onPress={() => handleThemeChange('dark')}
              colors={colors}
            />
          </View>
        </View>

        {/* Notificações */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Notificações</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Ativar notificações
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                Lembretes e atualizações importantes
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationsChange}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={settings.notificationsEnabled ? colors.surface : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Backup & Sincronização */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-outline" size={22} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Backup & Sincronização
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Backup automático
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                Salva periodicamente seus dados no dispositivo
              </Text>
            </View>
            <Switch
              value={settings.backupEnabled}
              onValueChange={handleBackupChange}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={settings.backupEnabled ? colors.surface : '#f4f3f4'}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Sincronizar com a nuvem
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                Guarda suas configurações no Firebase para restaurar em outros dispositivos
              </Text>
            </View>
            <Switch
              value={settings.syncEnabled}
              onValueChange={handleSyncChange}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={settings.syncEnabled ? colors.surface : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Ações gerais */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.resetButton}
            activeOpacity={0.7}
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.danger} />
            <Text style={[styles.resetText, { color: colors.danger }]}>
              Restaurar configurações padrão
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// Componente interno: ThemeOption
// -------------------------------------------------------------
interface ThemeOptionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  colors: any;
}

function ThemeOption({ label, icon, active, onPress, colors }: ThemeOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.surface : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? colors.primary : colors.textSecondary}
      />
      <Text
        style={[
          styles.themeOptionText,
          { color: active ? colors.primary : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// -------------------------------------------------------------
// Estilos
// -------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 200,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  themeOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 4,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAppVersion } from '@/hooks/useAppVersion';
import { Button } from '@/components/Button';

export default function AboutScreen() {
  const { theme } = useTheme();
  const {
    version,
    buildNumber,
    updateAvailable,
    checking,
    checkForUpdates,
    applyUpdate,
  } = useAppVersion();

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sobre o Estabiliza</Text>

      <View style={styles.card}>
        <Text style={styles.item}>
          <Text style={styles.label}>Versão: </Text>
          <Text style={styles.value}>{version}</Text>
        </Text>
        <Text style={styles.item}>
          <Text style={styles.label}>Build: </Text>
          <Text style={styles.value}>{buildNumber}</Text>
        </Text>
        <Text style={styles.item}>
          <Text style={styles.label}>Atualização disponível: </Text>
          <Text style={styles.value}>{updateAvailable ? 'Sim' : 'Não'}</Text>
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title={checking ? 'Verificando...' : 'Procurar atualizações'}
          onPress={checkForUpdates}
          disabled={checking}
        />
        <View style={{ height: theme.spacing.md }} />
        <Button
          title="Aplicar atualização"
          onPress={applyUpdate}
          disabled={!updateAvailable}
          variant="secondary" // ← substitui "outline" por algo suportado
        />
      </View>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} Estabiliza. Todos os direitos reservados.
      </Text>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.xl,
    },
    item: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    label: {
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    value: {
      color: theme.colors.text,
    },
    actions: {
      marginBottom: theme.spacing.xl,
    },
    footer: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  });

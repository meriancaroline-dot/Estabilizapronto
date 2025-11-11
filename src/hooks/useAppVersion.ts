import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

// -------------------------------------------------------------
// 🧩 Hook — Lida com versão do app e atualização OTA (Expo)
// -------------------------------------------------------------
export function useAppVersion() {
  const [version, setVersion] = useState<string>('...');
  const [buildNumber, setBuildNumber] = useState<string>('...');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

  // -----------------------------------------------------------
  // Obtém informações básicas da versão instalada
  // -----------------------------------------------------------
  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const v = Application.nativeApplicationVersion ?? 'Desconhecida';
        const b = Application.nativeBuildVersion ?? '0';
        setVersion(v);
        setBuildNumber(b);
      } catch (err) {
        console.error('Erro ao obter versão do app:', err);
      }
    };

    getAppInfo();
  }, []);

  // -----------------------------------------------------------
  // Verifica se há atualização disponível via OTA (Expo)
  // -----------------------------------------------------------
  const checkForUpdates = async () => {
    try {
      setChecking(true);
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        Alert.alert(
          'Atualização disponível',
          'Uma nova versão do Estabiliza está pronta para ser baixada.',
          [
            { text: 'Agora não', style: 'cancel' },
            { text: 'Atualizar', onPress: () => applyUpdate() },
          ]
        );
      } else {
        Alert.alert('Tudo certo', 'Você já está na versão mais recente.');
      }
    } catch (err) {
      console.error('Erro ao verificar atualização:', err);
      Alert.alert('Erro', 'Não foi possível verificar atualizações.');
    } finally {
      setChecking(false);
    }
  };

  // -----------------------------------------------------------
  // Aplica atualização e reinicia o app
  // -----------------------------------------------------------
  const applyUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (err) {
      console.error('Erro ao aplicar atualização:', err);
      Alert.alert('Erro', 'Falha ao aplicar atualização.');
    }
  };

  return {
    version,
    buildNumber,
    updateAvailable,
    checking,
    checkForUpdates,
    applyUpdate,
  };
}

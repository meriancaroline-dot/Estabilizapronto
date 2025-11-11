import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// -------------------------------------------------------
// Tipagem do retorno
// -------------------------------------------------------
interface UseNetworkReturn {
  isConnected: boolean;
  isInternetReachable: boolean;
  networkType: string | null;
  refresh: () => Promise<void>;
  lastChange?: Date;
}

// -------------------------------------------------------
// Hook principal
// -------------------------------------------------------
export function useNetwork(): UseNetworkReturn {
  const [state, setState] = useState<NetInfoState | null>(null);
  const [lastChange, setLastChange] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((info: NetInfoState) => {
      setState(info);
      setLastChange(new Date());
      console.log(`📡 Conexão mudou: ${info.isConnected ? 'Online' : 'Offline'}`);
    });

    // Busca inicial
    NetInfo.fetch().then((info: NetInfoState) => {
      setState(info);
      setLastChange(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected: !!state?.isConnected,
    isInternetReachable: !!state?.isInternetReachable,
    networkType: state?.type ?? null,
    refresh: async () => {
      const info = await NetInfo.fetch();
      setState(info);
      setLastChange(new Date());
    },
    lastChange,
  };
}

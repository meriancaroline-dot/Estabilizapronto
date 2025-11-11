import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// -------------------------------------------------------------
// Tipagem do retorno
// -------------------------------------------------------------
interface UseAppStateReturn {
  appState: AppStateStatus;
  isForeground: boolean;
  isBackground: boolean;
  onChange: (callback: (nextState: AppStateStatus) => void) => void;
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useAppState(): UseAppStateReturn {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const lastState = useRef<AppStateStatus>(AppState.currentState);
  const callbacks = useRef<((state: AppStateStatus) => void)[]>([]);

  // -----------------------------------------------------------
  // Listener do ciclo de vida
  // -----------------------------------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      // Evita re-render redundante
      if (lastState.current === nextState) return;

      lastState.current = nextState;
      setAppState(nextState);

      // Dispara callbacks registrados
      callbacks.current.forEach((cb) => cb(nextState));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // -----------------------------------------------------------
  // Registrar callback externo
  // -----------------------------------------------------------
  const onChange = (callback: (nextState: AppStateStatus) => void) => {
    callbacks.current.push(callback);
  };

  return {
    appState,
    isForeground: appState === 'active',
    isBackground: appState !== 'active',
    onChange,
  };
}

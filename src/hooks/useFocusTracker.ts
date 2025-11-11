import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// -------------------------------------------------------------
// 🎯 Hook — Detecta foco e saída de tela
// -------------------------------------------------------------
export function useFocusTracker(onFocus?: () => void, onBlur?: () => void) {
  const isFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      if (onFocus) onFocus();
      console.log('🟢 Tela focada');

      return () => {
        isFocused.current = false;
        if (onBlur) onBlur();
        console.log('🔴 Tela desfocada');
      };
    }, [onFocus, onBlur]),
  );

  return { isFocused: isFocused.current };
}

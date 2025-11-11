import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseStorageOptions<T> {
  key: string;
  initialValue: T;
}

interface UseStorageReturn<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  save: (newValue: T) => Promise<void>;
  load: () => Promise<void>;
  clear: () => Promise<void>;
  isLoaded: boolean;
  error: string | null;
}

export function useStorage<T>({
  key,
  initialValue,
}: UseStorageOptions<T>): UseStorageReturn<T> {
  const initialValueRef = useRef(initialValue);
  
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(key);
      if (json) {
        const parsed = JSON.parse(json) as T;
        setValue(parsed);
      } else {
        setValue(initialValueRef.current);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error(`Erro ao carregar chave ${key}:`, e);
      setError('Falha ao carregar dados.');
    }
  }, [key]);

  const save = useCallback(
    async (newValue: T) => {
      try {
        const json = JSON.stringify(newValue);
        await AsyncStorage.setItem(key, json);
        setValue(newValue);
      } catch (e) {
        console.error(`Erro ao salvar chave ${key}:`, e);
        setError('Falha ao salvar dados.');
      }
    },
    [key],
  );

  const clear = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setValue(initialValueRef.current);
    } catch (e) {
      console.error(`Erro ao limpar chave ${key}:`, e);
      setError('Falha ao limpar dados.');
    }
  }, [key]);

  return {
    value,
    setValue,
    save,
    load,
    clear,
    isLoaded,
    error,
  };
}
// -------------------------------------------------------------
// src/services/StorageService.ts
// Serviço de armazenamento local (AsyncStorage + cache em memória)
// -------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface StorageService {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// -------------------------------------------------------------
// Cache em memória (pra evitar IO desnecessário)
// -------------------------------------------------------------
const memoryCache = new Map<string, unknown>();

// -------------------------------------------------------------
// Helper: tratamento de JSON seguro
// -------------------------------------------------------------
function safeParse<T>(value: string | null): T | null {
  try {
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Funções principais
// -------------------------------------------------------------
async function getItem<T>(key: string): Promise<T | null> {
  try {
    // 1️⃣ Primeiro tenta buscar do cache em memória
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }

    // 2️⃣ Se não estiver no cache, busca no AsyncStorage
    const jsonValue = await AsyncStorage.getItem(key);
    const parsed = safeParse<T>(jsonValue);

    if (parsed !== null) {
      memoryCache.set(key, parsed);
    }

    return parsed;
  } catch (error) {
    console.error(`Erro ao ler a chave "${key}":`, error);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    memoryCache.set(key, value);
  } catch (error) {
    console.error(`Erro ao salvar a chave "${key}":`, error);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    memoryCache.delete(key);
  } catch (error) {
    console.error(`Erro ao remover a chave "${key}":`, error);
  }
}

async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
    memoryCache.clear();
  } catch (error) {
    console.error('Erro ao limpar o AsyncStorage:', error);
  }
}

async function getAllKeys(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
return [...keys]; // cria uma cópia mutável
  } catch (error) {
    console.error('Erro ao listar chaves do AsyncStorage:', error);
    return [];
  }
}

// -------------------------------------------------------------
// Exporta o serviço completo
// -------------------------------------------------------------
export const storage: StorageService = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
};

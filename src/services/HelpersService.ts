// -------------------------------------------------------------
// src/services/HelpersService.ts
// Funções utilitárias gerais do Estabiliza
// -------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';

// -------------------------------------------------------------
// Geradores e transformadores de texto
// -------------------------------------------------------------

/**
 * Gera um ID único (UUID v4)
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Capitaliza a primeira letra de uma string.
 * Ex: "olá mundo" -> "Olá mundo"
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Trunca uma string com reticências, mantendo o comprimento máximo.
 * Ex: truncate("texto muito longo", 10) -> "texto mui..."
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  return text.length > length ? text.substring(0, length).trimEnd() + '...' : text;
}

/**
 * Remove acentuação e espaços extras (para buscas).
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Formata um número com duas casas decimais.
 */
export function formatNumber(value: number, decimals = 2): string {
  if (isNaN(value)) return '0';
  return value.toFixed(decimals);
}

// -------------------------------------------------------------
// Manipulação de arrays e objetos
// -------------------------------------------------------------

/**
 * Agrupa um array de objetos por uma chave.
 * Ex: groupBy(users, 'role')
 */
export function groupBy<T extends Record<string, any>>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicatas de um array simples.
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Ordena um array de objetos por uma chave numérica ou string.
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }
    return direction === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });
}

/**
 * Retorna o item com maior valor de uma chave numérica.
 */
export function maxBy<T>(array: T[], key: keyof T): T | null {
  if (!array.length) return null;
  return array.reduce((prev, current) => {
    return (Number(current[key]) || 0) > (Number(prev[key]) || 0) ? current : prev;
  });
}

/**
 * Retorna o item com menor valor de uma chave numérica.
 */
export function minBy<T>(array: T[], key: keyof T): T | null {
  if (!array.length) return null;
  return array.reduce((prev, current) => {
    return (Number(current[key]) || 0) < (Number(prev[key]) || 0) ? current : prev;
  });
}

/**
 * Soma os valores numéricos de uma chave em um array de objetos.
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
}

/**
 * Faz uma pausa assíncrona (delay).
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gera um valor aleatório entre min e max (inclusive).
 */
export function randomInt(min: number, max: number): number {
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
}

// -------------------------------------------------------------
// Exporta tudo organizado
// -------------------------------------------------------------
export const HelpersService = {
  generateId,
  capitalize,
  truncate,
  normalizeString,
  formatNumber,
  groupBy,
  unique,
  sortBy,
  maxBy,
  minBy,
  sumBy,
  sleep,
  randomInt,
};

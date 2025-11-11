// -------------------------------------------------------------
// src/services/DateService.ts
// Serviço de formatação e manipulação de datas
// -------------------------------------------------------------

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isTodayPlugin from 'dayjs/plugin/isToday';
import isTomorrowPlugin from 'dayjs/plugin/isTomorrow';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import 'dayjs/locale/pt-br';

// Ativa os plugins do dayjs
dayjs.extend(relativeTime);
dayjs.extend(isTodayPlugin);
dayjs.extend(isTomorrowPlugin);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

// Define locale português
dayjs.locale('pt-br');

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface DateFormatOptions {
  format?: string; // Exemplo: "DD/MM/YYYY"
  relative?: boolean;
}

// -------------------------------------------------------------
// Funções principais
// -------------------------------------------------------------

/**
 * Formata uma data no formato desejado.
 * Ex: formatDate('2025-10-28', 'DD/MM/YYYY') -> "28/10/2025"
 */
export function formatDate(date: string | Date, format = 'DD/MM/YYYY'): string {
  if (!date) return '';
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format(format) : '';
}

/**
 * Formata uma data/hora no formato completo.
 * Ex: formatDateTime('2025-10-28T13:45') -> "28/10/2025 13:45"
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY HH:mm') : '';
}

/**
 * Retorna diferença relativa de tempo em português.
 * Ex: formatRelative('2025-10-28T13:45') -> "há 5 minutos"
 */
export function formatRelative(date: string | Date): string {
  if (!date) return '';
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.fromNow() : '';
}

/**
 * Verifica se a data é hoje.
 */
export function isToday(date: string | Date): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  return parsed.isValid() && parsed.isToday();
}

/**
 * Verifica se a data é amanhã.
 */
export function isTomorrow(date: string | Date): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  return parsed.isValid() && parsed.isTomorrow();
}

/**
 * Verifica se a data é desta semana.
 */
export function isThisWeek(date: string | Date): boolean {
  if (!date) return false;
  const parsed = dayjs(date);
  const now = dayjs();
  return parsed.isValid() && parsed.week() === now.week() && parsed.year() === now.year();
}

/**
 * Retorna diferença em dias entre duas datas.
 */
export function diffInDays(a: string | Date, b: string | Date): number {
  const d1 = dayjs(a);
  const d2 = dayjs(b);
  if (!d1.isValid() || !d2.isValid()) return 0;
  return d1.diff(d2, 'day');
}

/**
 * Retorna diferença em horas entre duas datas.
 */
export function diffInHours(a: string | Date, b: string | Date): number {
  const d1 = dayjs(a);
  const d2 = dayjs(b);
  if (!d1.isValid() || !d2.isValid()) return 0;
  return d1.diff(d2, 'hour');
}

/**
 * Retorna diferença em minutos entre duas datas.
 */
export function diffInMinutes(a: string | Date, b: string | Date): number {
  const d1 = dayjs(a);
  const d2 = dayjs(b);
  if (!d1.isValid() || !d2.isValid()) return 0;
  return d1.diff(d2, 'minute');
}

/**
 * Retorna se a data A é anterior à data B.
 */
export function isBefore(a: string | Date, b: string | Date): boolean {
  const d1 = dayjs(a);
  const d2 = dayjs(b);
  return d1.isValid() && d2.isValid() && d1.isBefore(d2);
}

/**
 * Retorna se a data A é posterior à data B.
 */
export function isAfter(a: string | Date, b: string | Date): boolean {
  const d1 = dayjs(a);
  const d2 = dayjs(b);
  return d1.isValid() && d2.isValid() && d1.isAfter(d2);
}

/**
 * Retorna se a data A está entre B e C (inclusive).
 */
export function isBetween(a: string | Date, start: string | Date, end: string | Date): boolean {
  const d = dayjs(a);
  const s = dayjs(start);
  const e = dayjs(end);
  return d.isValid() && s.isValid() && e.isValid() && d.isSameOrAfter(s) && d.isSameOrBefore(e);
}

/**
 * Adiciona dias a uma data.
 */
export function addDays(date: string | Date, days: number): string {
  const d = dayjs(date);
  return d.isValid() ? d.add(days, 'day').toISOString() : '';
}

/**
 * Subtrai dias de uma data.
 */
export function subtractDays(date: string | Date, days: number): string {
  const d = dayjs(date);
  return d.isValid() ? d.subtract(days, 'day').toISOString() : '';
}

// -------------------------------------------------------------
// Exporta tudo organizado
// -------------------------------------------------------------
export const DateService = {
  formatDate,
  formatDateTime,
  formatRelative,
  isToday,
  isTomorrow,
  isThisWeek,
  diffInDays,
  diffInHours,
  diffInMinutes,
  isBefore,
  isAfter,
  isBetween,
  addDays,
  subtractDays,
};

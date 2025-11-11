// -------------------------------------------------------------
// src/services/ExportService.ts
// Serviço para exportar dados do app (JSON e CSV)
// -------------------------------------------------------------

import * as FileSystem from "expo-file-system/legacy";

import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  reminders: Reminder[];
  moods: MoodEntry[];
  habits: Habit[];
  achievements: Achievement[];
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  isCompleted: boolean;
  userId: string;
}

export interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  activities?: string[];
  date: string;
  userId: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: string;
  streak: number;
  completedDates: string[];
  userId: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlockedAt?: string;
  userId: string;
}

// -------------------------------------------------------------
// Utilitários
// -------------------------------------------------------------

/**
 * Converte um array de objetos em CSV.
 */
function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0] ?? {});
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = (row[h] ?? '').toString().replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(','),
    ),
  ];
  return csvRows.join('\n');
}

/**
 * Cria e salva um arquivo no diretório temporário.
 */
async function saveFile(filename: string, content: string, type: 'json' | 'csv'): Promise<string> {
  // Acessamos dinamicamente para contornar bug dos tipos
  const cacheDir = (FileSystem as any)['cacheDirectory'] as string | undefined;
  const docDir = (FileSystem as any)['documentDirectory'] as string | undefined;

  const dir = cacheDir ?? docDir ?? '';
  if (!dir) throw new Error('Diretório do sistema de arquivos não encontrado.');

  const path = `${dir}${filename}.${type}`;
  await FileSystem.writeAsStringAsync(path, content, { encoding: 'utf8' });
  return path;
}

/**
 * Compartilha um arquivo via sistema (Android/iOS).
 */
async function shareFile(fileUri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartilhamento não suportado neste dispositivo.');
  }
  await Sharing.shareAsync(fileUri);
}

// -------------------------------------------------------------
// Funções principais
// -------------------------------------------------------------

/**
 * Exporta todos os dados em JSON.
 */
export async function exportToJSON(data: UserData): Promise<string> {
  const json = JSON.stringify(data, null, 2);
  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const filename = `estabiliza_backup_${timestamp}`;
  const fileUri = await saveFile(filename, json, 'json');
  await shareFile(fileUri);
  return fileUri;
}

/**
 * Exporta todos os dados em CSV (um arquivo por tipo).
 */
export async function exportToCSV(data: UserData): Promise<string[]> {
  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  const exported: string[] = [];

  const exportables = [
    { name: 'reminders', dataset: data.reminders },
    { name: 'moods', dataset: data.moods },
    { name: 'habits', dataset: data.habits },
    { name: 'achievements', dataset: data.achievements },
  ];

  for (const { name, dataset } of exportables) {
    if (dataset && dataset.length > 0) {
      const csv = convertToCSV(dataset as Record<string, any>[]);
      const filename = `estabiliza_${name}_${timestamp}`;
      const path = await saveFile(filename, csv, 'csv');
      exported.push(path);
    }
  }

  if (exported.length > 0) {
    await shareFile(exported[0]!);
  }

  return exported;
}

/**
 * Cria um pacote de exportação unificado (JSON + CSV).
 */
export async function exportAll(data: UserData): Promise<void> {
  await exportToJSON(data);
  await exportToCSV(data);
  console.log('📦 Exportação completa!');
}

// -------------------------------------------------------------
// Exporta tudo organizado
// -------------------------------------------------------------
export const ExportService = {
  exportToJSON,
  exportToCSV,
  exportAll,
};

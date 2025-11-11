// -------------------------------------------------------------
// src/services/ValidationService.ts
// Serviço central de validações e formatações de campos
// -------------------------------------------------------------

import dayjs from 'dayjs';

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// -------------------------------------------------------------
// Validações básicas
// -------------------------------------------------------------

/**
 * Valida se um campo obrigatório foi preenchido.
 */
export function validateRequired(value: unknown, fieldName?: string): ValidationResult {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return {
      valid: false,
      message: fieldName ? `O campo "${fieldName}" é obrigatório.` : 'Campo obrigatório.',
    };
  }
  return { valid: true };
}

/**
 * Valida e-mail com expressão regular.
 */
export function validateEmail(email: string): ValidationResult {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email.trim())) {
    return { valid: false, message: 'E-mail inválido.' };
  }
  return { valid: true };
}

/**
 * Valida nomes (mínimo 2 caracteres e apenas letras e espaços).
 */
export function validateName(name: string): ValidationResult {
  const regex = /^[A-Za-zÀ-ÿ\s]{2,}$/;
  if (!regex.test(name.trim())) {
    return { valid: false, message: 'Nome inválido.' };
  }
  return { valid: true };
}

/**
 * Valida se data e hora formam um horário válido (e não no passado).
 */
export function validateDateTime(date: string, time?: string): ValidationResult {
  if (!date) return { valid: false, message: 'Data obrigatória.' };

  const parsedDate = dayjs(date);
  if (!parsedDate.isValid()) {
    return { valid: false, message: 'Data inválida.' };
  }

  if (time) {
    const parts = time.split(':');
    const h = Number(parts[0] ?? 0);
    const m = Number(parts[1] ?? 0);
    const combined = parsedDate.hour(h).minute(m);

    if (combined.isBefore(dayjs())) {
      return { valid: false, message: 'Data e hora não podem ser no passado.' };
    }
  }

  return { valid: true };
}

/**
 * Valida um número dentro de um intervalo.
 */
export function validateNumberRange(value: number, min: number, max: number, fieldName?: string): ValidationResult {
  if (isNaN(value)) {
    return { valid: false, message: `${fieldName || 'Valor'} inválido.` };
  }
  if (value < min || value > max) {
    return {
      valid: false,
      message: `${fieldName || 'Valor'} deve estar entre ${min} e ${max}.`,
    };
  }
  return { valid: true };
}

/**
 * Valida uma senha (mínimo 6 caracteres).
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 6) {
    return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }
  return { valid: true };
}

/**
 * Valida uma string com tamanho mínimo e máximo.
 */
export function validateStringLength(value: string, min = 1, max = 255, fieldName?: string): ValidationResult {
  if (!value || value.length < min) {
    return {
      valid: false,
      message: `${fieldName || 'Campo'} deve ter pelo menos ${min} caracteres.`,
    };
  }
  if (value.length > max) {
    return {
      valid: false,
      message: `${fieldName || 'Campo'} deve ter no máximo ${max} caracteres.`,
    };
  }
  return { valid: true };
}

// -------------------------------------------------------------
// Validação de objetos (User, Reminder, Habit etc.)
// -------------------------------------------------------------

export interface UserInput {
  name: string;
  email: string;
}

export interface ReminderInput {
  title: string;
  description?: string;
  date: string;
  time: string;
}

export interface HabitInput {
  name: string;
  category: string;
  frequency: string;
}

export function validateUserInput(data: UserInput): ValidationResult {
  const nameVal = validateName(data.name);
  if (!nameVal.valid) return nameVal;

  const emailVal = validateEmail(data.email);
  if (!emailVal.valid) return emailVal;

  return { valid: true };
}

export function validateReminderInput(data: ReminderInput): ValidationResult {
  const requiredTitle = validateRequired(data.title, 'Título');
  if (!requiredTitle.valid) return requiredTitle;

  const dateVal = validateDateTime(data.date, data.time);
  if (!dateVal.valid) return dateVal;

  return { valid: true };
}

export function validateHabitInput(data: HabitInput): ValidationResult {
  const nameVal = validateRequired(data.name, 'Nome do hábito');
  if (!nameVal.valid) return nameVal;

  const catVal = validateRequired(data.category, 'Categoria');
  if (!catVal.valid) return catVal;

  return { valid: true };
}

// -------------------------------------------------------------
// Helpers gerais de validação
// -------------------------------------------------------------

export function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function hasError(results: ValidationResult[]): ValidationResult | null {
  return results.find((r) => !r.valid) || null;
}

// -------------------------------------------------------------
// Exporta tudo organizado
// -------------------------------------------------------------
export const ValidationService = {
  validateRequired,
  validateEmail,
  validateName,
  validateDateTime,
  validateNumberRange,
  validatePassword,
  validateStringLength,
  validateUserInput,
  validateReminderInput,
  validateHabitInput,
  isEmpty,
  hasError,
};

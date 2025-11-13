// src/utils/errorHandler.ts
import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string): void {
  console.error(`[${context || 'Error'}]`, error);

  let userMessage = 'Ocorreu um erro inesperado.';
  let title = 'Erro';

  if (error instanceof AppError) {
    userMessage = error.userMessage;
  } else if (error instanceof Error) {
    if (error.message.includes('auth/user-not-found')) {
      title = 'Usuário não encontrado';
      userMessage = 'Este e-mail não está cadastrado.';
    } else if (error.message.includes('auth/wrong-password')) {
      title = 'Senha incorreta';
      userMessage = 'A senha digitada está incorreta.';
    } else if (error.message.includes('auth/email-already-in-use')) {
      title = 'E-mail já cadastrado';
      userMessage = 'Este e-mail já está em uso.';
    } else if (error.message.includes('auth/invalid-credential')) {
      title = 'Credenciais inválidas';
      userMessage = 'E-mail ou senha incorretos.';
    } else if (error.message.includes('auth/network-request-failed')) {
      title = 'Sem conexão';
      userMessage = 'Verifique sua conexão com a internet.';
    } else if (error.message.includes('auth/too-many-requests')) {
      title = 'Muitas tentativas';
      userMessage = 'Aguarde alguns minutos e tente novamente.';
    } else if (error.message.includes('auth/weak-password')) {
      title = 'Senha fraca';
      userMessage = 'Use uma senha com no mínimo 6 caracteres.';
    } else if (error.message) {
      userMessage = error.message;
    }
  }

  Alert.alert(title, userMessage, [{ text: 'OK' }]);
}

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}

export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => handleError(error, context),
    logError: (error: unknown, context?: string) => {
      console.error(`[${context || 'Error'}]`, error);
    },
  };
}
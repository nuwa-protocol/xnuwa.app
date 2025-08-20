import type { UIMessage } from 'ai';
import { getLocale } from '@/shared/locales';
import { generateUUID } from '@/shared/utils';

// error level
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// error handler options
interface ErrorHandlerOptions {
  level?: ErrorLevel;
  showToUser?: boolean;
}

const locale = getLocale('en');

// create error message
export function createErrorMessage(
  error: string | Error,
  options: ErrorHandlerOptions = {},
): UIMessage {
  try {
    const { level = 'error', showToUser = true } = options;

    // defensive check: ensure level is a valid string
    const validLevel = typeof level === 'string' && level ? level : 'error';

    const errorText = error instanceof Error ? error.message : error;

    if (!showToUser) {
      return createSystemMessage(locale.error.tryAgain);
    }

    return createSystemMessage(
      formatErrorForUser(errorText, validLevel as ErrorLevel),
    );
  } catch (internalError) {
    // return a basic error message
    return {
      id: generateUUID(),
      role: 'assistant',
      content: 'An error occurred. Please try again.',
      parts: [{ type: 'text', text: 'An error occurred. Please try again.' }],
      createdAt: new Date(),
    };
  }
}

// format error message for user
function formatErrorForUser(errorText: string, level: ErrorLevel): string {
  const emoji = getErrorEmoji(level);
  const prefix = getErrorPrefix(level);

  return `${prefix}: ${errorText}`;
}

// get error emoji
function getErrorEmoji(level: ErrorLevel): string {
  switch (level) {
    case 'info':
      return 'ℹ️';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'critical':
      return '🚨';
    default:
      return '❌';
  }
}

// get error prefix
function getErrorPrefix(level: ErrorLevel): string {
  switch (level) {
    case 'info':
      return locale.error.info;
    case 'warning':
      return locale.error.warning;
    case 'error':
      return locale.error.error;
    case 'critical':
      return locale.error.critical;
    default:
      return locale.error.error;
  }
}

// create system message
function createSystemMessage(content: string): UIMessage {
  return {
    id: generateUUID(),
    role: 'assistant',
    content,
    parts: [{ type: 'text', text: content }],
    createdAt: new Date(),
  };
}

// common error types
export const ErrorHandlers = {
  network: (error?: string) =>
    createErrorMessage(error || locale.error.network, { level: 'error' }),

  api: (error?: string) =>
    createErrorMessage(error || locale.error.api, { level: 'error' }),

  storage: (error?: string) =>
    createErrorMessage(error || locale.error.storage, { level: 'warning' }),

  validation: (error?: string) =>
    createErrorMessage(error || locale.error.validation, { level: 'warning' }),

  permission: (error?: string) =>
    createErrorMessage(error || locale.error.permission, { level: 'error' }),

  notFound: (resource = 'resource') =>
    createErrorMessage(
      locale.error.notFound.replace('{{resource}}', resource),
      {
        level: 'warning',
      },
    ),

  timeout: (operation = 'operation') =>
    createErrorMessage(
      locale.error.timeout.replace('{{operation}}', operation),
      {
        level: 'warning',
      },
    ),

  generic: (error?: string) =>
    createErrorMessage(error || locale.error.generic, { level: 'error' }),
};

// error boundary handler
export function handleAsyncError<T>(
  promise: Promise<T>,
  fallback?: () => T,
): Promise<T | null> {
  return promise.catch((error) => {
    console.error(error);
    return fallback ? fallback() : null;
  });
}

// retry mechanism
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw new Error('Max retries exceeded');
}

import type { UIMessage } from 'ai';
import { generateUUID } from '@/utils';
import { getLocale } from '@/locales';

// 错误级别
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// 错误处理接口
interface ErrorHandlerOptions {
  level?: ErrorLevel;
  showToUser?: boolean;
}

const locale = getLocale('en');

// 创建错误消息
export function createErrorMessage(
  error: string | Error,
  options: ErrorHandlerOptions = {},
): UIMessage {
  try {
    const { level = 'error', showToUser = true } = options;

    // 防御性检查：确保 level 是有效的字符串
    const validLevel = typeof level === 'string' && level ? level : 'error';

    const errorText = error instanceof Error ? error.message : error;

    if (!showToUser) {
      return createSystemMessage(locale.error.tryAgain);
    }

    return createSystemMessage(
      formatErrorForUser(errorText, validLevel as ErrorLevel),
    );
  } catch (internalError) {
    // 返回一个最基本的错误消息
    return {
      id: generateUUID(),
      role: 'assistant',
      content: 'An error occurred. Please try again.',
      parts: [{ type: 'text', text: 'An error occurred. Please try again.' }],
      createdAt: new Date(),
    };
  }
}

// 格式化错误信息给用户
function formatErrorForUser(errorText: string, level: ErrorLevel): string {
  const emoji = getErrorEmoji(level);
  const prefix = getErrorPrefix(level);

  return `${emoji} **${prefix}**: ${errorText}\n\n*${locale.error.persist}*`;
}

// 获取错误表情符号
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

// 获取错误前缀
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

// 创建系统消息
function createSystemMessage(content: string): UIMessage {
  return {
    id: generateUUID(),
    role: 'assistant',
    content,
    parts: [{ type: 'text', text: content }],
    createdAt: new Date(),
  };
}

// 常见错误类型处理
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

// 错误边界处理函数
export function handleAsyncError<T>(
  promise: Promise<T>,
  fallback?: () => T,
): Promise<T | null> {
  return promise.catch((error) => {
    return fallback ? fallback() : null;
  });
}

// 重试机制
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

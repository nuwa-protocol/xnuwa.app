import { Sentry } from '@/shared/services/sentry';

export enum ChatErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  IGNORED_ERROR = 'IGNORED_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Configuration: Error patterns to ignore (case-insensitive matching) for the client user
const IGNORED_ERROR_PATTERNS = ['payeedid'];

// Configuration: Error patterns to ignore (case-insensitive matching) for the developer and the user
const IGNORED_ERROR_PATTERNS_DEVELOPER = [
  'aborterror',
  'ReadableStreamDefaultController',
];

const INSUFFICIENT_FUNDS_ERROR_PATTERNS = ['balance', 'insufficient'];

const shouldIgnoreErrorForClient = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();
  return IGNORED_ERROR_PATTERNS.some((pattern) =>
    lowerMessage.includes(pattern.toLowerCase()),
  );
};

const shouldIgnoreErrorForDeveloper = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();
  return IGNORED_ERROR_PATTERNS_DEVELOPER.some((pattern) =>
    lowerMessage.includes(pattern.toLowerCase()),
  );
};

const classifyClientErrorCode = (errorMessage: string): ChatErrorCode => {
  if (shouldIgnoreErrorForClient(errorMessage)) {
    return ChatErrorCode.IGNORED_ERROR;
  }

  if (
    INSUFFICIENT_FUNDS_ERROR_PATTERNS.some((pattern) =>
      errorMessage.includes(pattern.toLowerCase()),
    )
  ) {
    return ChatErrorCode.INSUFFICIENT_FUNDS;
  }

  return ChatErrorCode.UNKNOWN_ERROR;
};

export const resolveChatErrorCode = (error: Error) => {
  const errorMessage = error.message;

  if (shouldIgnoreErrorForDeveloper(errorMessage)) {
    return ChatErrorCode.IGNORED_ERROR;
  }

  return classifyClientErrorCode(errorMessage);
};

export const handleError = (error: Error) => {
  const errorMessage = error.message;

  console.error('[Handle Chat Error]', errorMessage);

  if (shouldIgnoreErrorForDeveloper(errorMessage)) {
    return ChatErrorCode.IGNORED_ERROR;
  }

  console.error(error);
  Sentry.captureException(error);

  return classifyClientErrorCode(errorMessage);
};

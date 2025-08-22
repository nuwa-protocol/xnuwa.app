import { Sentry } from '@/shared/services/sentry';

// Configuration: Error patterns to ignore (case-insensitive matching) for the client user
const IGNORED_ERROR_PATTERNS = ['json parsing'];

// Configuration: Error patterns to ignore (case-insensitive matching) for the developer
const IGNORED_ERROR_PATTERNS_DEVELOPER = ['aborterror'];

// Configuration: Standard error message returned to client
const CLIENT_ERROR_MESSAGE =
  'Please check your network connection and try again.';

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

export const getErrorMessage = (error: unknown): string => {
  let errorMessage = '';

  // Extract error message for checking ignore patterns
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'toString' in error) {
    errorMessage = error.toString();
  } else {
    errorMessage = 'Unknown error occurred';
  }

  // Log error to console
  console.error('Chat Stream', error);

  // Check if error should be ignored for developer, if true, not sending errors to sentry
  if (shouldIgnoreErrorForDeveloper(errorMessage)) {
    return 'IGNORED_ERROR';
  }

  // Capture error with Sentry
  Sentry.captureException(error);

  // Check if error should be ignored, errors are still sent to sentry
  if (shouldIgnoreErrorForClient(errorMessage)) {
    return 'IGNORED_ERROR';
  }

  // Always return the same message to client
  return CLIENT_ERROR_MESSAGE;
};

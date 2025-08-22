import { Sentry } from '@/shared/services/sentry';

// Configuration: Error patterns to ignore (case-insensitive matching)
const IGNORED_ERROR_PATTERNS = ['json parsing', 'payeedid'];

// Configuration: Standard error message returned to client
const CLIENT_ERROR_MESSAGE =
  'Please check your network connection and try again.';

const shouldIgnoreError = (errorMessage: string): boolean => {
  const lowerMessage = errorMessage.toLowerCase();
  return IGNORED_ERROR_PATTERNS.some((pattern) =>
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

  // Check if error should be ignored
  if (shouldIgnoreError(errorMessage)) {
    return 'IGNORED_ERROR';
  }

  // Log error to console
  console.error('Chat Stream', error);

  // Capture error with Sentry
  Sentry.captureException(error);

  // Always return the same message to client
  return CLIENT_ERROR_MESSAGE;
};

import { Database } from 'lucide-react';
import React, { Component, type ReactNode } from 'react';
import { useStorage } from '@/shared/hooks/use-storage';
import { getLocale } from '@/shared/locales';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

const locale = getLocale('en');

// Functional component for storage clearing (since we need hooks)
function ErrorActions({
  onRetry,
  onReload,
}: {
  onRetry: () => void;
  onReload: () => void;
}) {
  const { clearAllStorage } = useStorage();

  const handleClearStorage = async () => {
    try {
      await clearAllStorage();
      // Show success message
      console.log('Storage cleared successfully');
      // Reload the page after clearing storage
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      // Still reload even if clearing fails
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button onClick={handleClearStorage} className="w-full" variant="outline">
        <Database className="mr-2 h-4 w-4" />
        Clear Storage
      </Button>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError prop if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Oops, something went wrong!
            </h1>
            <p className="mt-4 text-muted-foreground">
              An unexpected error has occurred. This might be caused by an
              incompatible upgrade of the product. Please try refresh the page
              or clear the storage.
            </p>
            <div className="mt-6">
              <ErrorActions
                onRetry={this.handleRetry}
                onReload={this.handleReload}
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple and reliable useErrorBoundary hook
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  // This will throw during render, which ErrorBoundary can catch
  if (error) {
    throw error;
  }

  return {
    throwError,
    resetError,
    hasError: error !== null,
  };
}

// Alternative hook that uses refs to ensure error is thrown in next render
export function useThrowAsyncError() {
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  const errorRef = React.useRef<Error | null>(null);

  const throwError = React.useCallback((error: Error) => {
    errorRef.current = error;
    forceUpdate(); // This will cause a re-render
  }, []);

  // Throw the error during render
  if (errorRef.current) {
    const error = errorRef.current;
    errorRef.current = null; // Clear the error
    throw error;
  }

  return throwError;
}

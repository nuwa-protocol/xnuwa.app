import { Database } from 'lucide-react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { useStorage } from '@/shared/hooks/use-storage';
import { getLocale } from '@/shared/locales';

const locale = getLocale('en');

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: any;
}

function ErrorActions() {
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

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const getErrorMessage = () => {
    if (error.status === 404) {
      return {
        title: 'Page not found',
        description:
          'Sorry, the page you are looking for does not exist. Please check the URL.',
      };
    }

    if (error.status === 403) {
      return {
        title: 'Access denied',
        description: 'You do not have permission to access this page.',
      };
    }

    if (error.status === 500) {
      return {
        title: 'Server error',
        description: 'The server encountered an error. Please try again later.',
      };
    }

    return {
      title: locale.error.error,
      description: error.message || error.statusText || locale.error.generic,
    };
  };

  const { title, description } = getErrorMessage();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Oops, something went wrong!
        </h1>
        <p className="mt-4 text-muted-foreground">
          An unexpected error has occurred. This might be caused by an
          incompatible upgrade of the product. Please try refresh the page or
          clear the storage.
        </p>

        <div className="mt-6">
          <ErrorActions />
        </div>
        {import.meta.env.DEV && error.data && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Developer information (only visible in development)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

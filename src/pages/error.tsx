import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Link, useNavigate, useRouteError } from 'react-router-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { getLocale } from '@/shared/locales';

const locale = getLocale('en');

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
  data?: any;
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">{title}</h1>

          <p className="text-muted-foreground">{description}</p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error information</AlertTitle>
          <AlertDescription>
            {error.status && (
              <span className="font-mono">
                {error.status} {error.statusText}
              </span>
            )}
            {error.message && (
              <div className="mt-1 text-sm">{error.message}</div>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={handleGoBack} variant="outline">
            Go back
          </Button>

          <Button asChild>
            <Link to="/chat">
              <Home className="mr-2 h-4 w-4" />
              Go to home
            </Link>
          </Button>

          <Button onClick={handleRetry} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>
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

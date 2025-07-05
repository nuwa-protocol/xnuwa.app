import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useStorage } from '@/shared/hooks/use-storage';

export const DevErrorCard = ({ error }: { error: Error | object }) => {
  const [copied, setCopied] = useState(false);
  let errorDetails = '';
  if (error instanceof Error) {
    errorDetails = error.stack || error.message;
  } else if (typeof error === 'object') {
    try {
      errorDetails = JSON.stringify(error, null, 2);
    } catch {
      errorDetails = String(error);
    }
  }
  const handleCopy = () => {
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-destructive/20 rounded-full blur-xl"></div>
          <AlertTriangle className="relative h-20 w-20 text-destructive" />
        </div>
        <div className="flex flex-col items-center justify-center p-6">
          <h1 className="text-2xl font-bold">Application Error</h1>
          <p className="p-4 text-muted-foreground">是时候修bug了! 🐛</p>
        </div>
      </div>
      <Card className=" max-w-3xl mx-auto bg-muted border-red-500 border-2">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="font-medium text-red-500">
            Error: {error instanceof Error ? error.message : 'Unknown'} (Only
            visible in development mode)
          </div>
          <CardAction>
            <Button
              size="sm"
              variant="outline"
              type="button"
              className="ml-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopy();
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto max-h-64">
            {errorDetails}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export const UserErrorCard = ({
  appError,
  error,
  statusCode,
  title,
  message,
}: {
  appError: boolean;
  error: Error | object;
  statusCode: number;
  title: string;
  message: string;
}) => {
  let errorDetails = '';
  if (error instanceof Error) {
    errorDetails = error.stack || error.message;
  } else if (typeof error === 'object') {
    try {
      errorDetails = JSON.stringify(error, null, 2);
    } catch {
      errorDetails = String(error);
    }
  }
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const { clearAllStorage } = useStorage();

  const handleClearStorage = () => {
    clearAllStorage();
    window.location.reload();
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-destructive/20 rounded-full blur-xl"></div>
              <AlertTriangle className="relative h-20 w-20 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl text-destructive">
              {statusCode !== 500 ? statusCode : ''}
            </CardTitle>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-lg">{message}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!appError ? (
              <>
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Previous Page
                </Button>

                <Button
                  onClick={handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </>
            ) : (
              <Button
                onClick={handleClearStorage}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Storage
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              If the problem persists, please contact us on{' '}
              <a
                href="https://github.com/nuwa-protocol/nuwa-client/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red font-bold"
              >
                Github
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ErrorPage() {
  const error = useRouteError();

  let title = 'Oops, something went wrong!';
  let message = `An unexpected error has occurred. This might be caused by an incompatible upgrade of the product. Please try refresh the page or clear the storage.`;
  let statusText = '';
  let statusCode = 500;
  let appError = true;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText;

    switch (error.status) {
      case 404:
        title = 'Page Not Found';
        message = 'Sorry, the page you visited does not exist.';
        appError = false;
        break;
      case 403:
        title = 'Access Denied';
        message = 'Sorry, you are not authorized to access this page.';
        appError = false;
        break;
      case 500:
        title = 'Server Error';
        message = 'Sorry, the server encountered a problem.';
        appError = false;
        break;
      default:
        title = `Error ${error.status}`;
        message = error.statusText || 'An unknown error occurred.';
    }
  }

  // Ensure error is always an object or Error
  const safeError: object | Error = error ?? { message: 'Unknown error' };

  return (
    <>
      {process.env.NODE_ENV === 'development' &&
      (safeError instanceof Error || typeof safeError === 'object') ? (
        <DevErrorCard error={safeError} />
      ) : (
        <UserErrorCard
          appError={appError}
          error={safeError}
          statusCode={statusCode}
          title={title}
          message={message}
        />
      )}
      {/* For debugging the user perspective error page */}
      {/* <UserErrorCard
        appError={appError}
        error={safeError}
        statusCode={statusCode}
        title={title}
        message={message}
      /> */}
    </>
  );
}

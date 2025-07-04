import { toast } from '@/shared/components/toast';
import { getLocale } from '@/shared/locales';

const locale = getLocale('en');

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: Date;
  feature?: string;
  action?: string;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

interface GlobalErrorHandlerConfig {
  enableReporting: boolean;
  enableToasts: boolean;
  enableConsoleLogging: boolean;
  maxRetries: number;
  retryDelay: number;
}

class GlobalErrorHandler {
  private config: GlobalErrorHandlerConfig = {
    enableReporting: true,
    enableToasts: true,
    enableConsoleLogging: true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private errorReports: ErrorReport[] = [];

  constructor(config?: Partial<GlobalErrorHandlerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // setup global error listeners
    this.setupGlobalErrorListeners();
  }

  private setupGlobalErrorListeners() {
    // capture unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        url: event.filename,
        action: 'global_javascript_error',
      });
    });

    // capture unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        {
          action: 'unhandled_promise_rejection',
        },
      );
    });
  }

  public handleError(error: Error, context: ErrorContext = {}) {
    const errorReport: ErrorReport = {
      error,
      context: {
        ...context,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      severity: this.determineSeverity(error),
      recoverable: this.isRecoverable(error),
    };

    // log error
    this.logError(errorReport);

    // show user-friendly error message
    this.showUserError(errorReport);

    // store error report
    this.storeErrorReport(errorReport);

    return errorReport;
  }

  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }

    if (message.includes('syntax') || message.includes('reference')) {
      return 'high';
    }

    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }

    return 'low';
  }

  private isRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // network errors are usually recoverable
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    ) {
      return true;
    }

    // syntax errors are usually not recoverable
    if (message.includes('syntax') || message.includes('unexpected token')) {
      return false;
    }

    return true;
  }

  private logError(errorReport: ErrorReport) {
    if (this.config.enableConsoleLogging) {
      console.group(`🚨 Error [${errorReport.severity.toUpperCase()}]`);
      console.error('Error:', errorReport.error);
      console.log('Context:', errorReport.context);
      console.log('Recoverable:', errorReport.recoverable);
      console.groupEnd();
    }
  }

  private showUserError(errorReport: ErrorReport) {
    if (!this.config.enableToasts) return;

    const { error, severity, recoverable } = errorReport;

    let message = locale.error.generic;

    if (error.message.includes('network')) {
      message = locale.error.network;
    } else if (error.message.includes('timeout')) {
      message = locale.error.timeout.replace('{{operation}}', '操作');
    }

    // only show toast for medium/high severity errors
    if (
      severity === 'medium' ||
      severity === 'high' ||
      severity === 'critical'
    ) {
      toast({
        type: 'error',
        description: `${message}${recoverable ? ' 请重试。' : ''}`,
      });
    }
  }

  private storeErrorReport(errorReport: ErrorReport) {
    this.errorReports.push(errorReport);

    // only keep last 100 error reports
    if (this.errorReports.length > 100) {
      this.errorReports = this.errorReports.slice(-100);
    }
  }

  // retry mechanism
  public async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    delay: number = this.config.retryDelay,
    context?: ErrorContext,
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.handleError(
            error instanceof Error ? error : new Error(String(error)),
            { ...context, action: 'retry_failed', feature: 'retry_mechanism' },
          );
          throw error;
        }

        // wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw new Error('Retry mechanism failed');
  }

  // get error stats
  public getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentErrors = this.errorReports.filter(
      (report) =>
        report.context.timestamp &&
        report.context.timestamp.getTime() > oneHourAgo,
    );

    return {
      total: this.errorReports.length,
      lastHour: recentErrors.length,
      bySeverity: {
        low: this.errorReports.filter((r) => r.severity === 'low').length,
        medium: this.errorReports.filter((r) => r.severity === 'medium').length,
        high: this.errorReports.filter((r) => r.severity === 'high').length,
        critical: this.errorReports.filter((r) => r.severity === 'critical')
          .length,
      },
      recoverable: this.errorReports.filter((r) => r.recoverable).length,
    };
  }

  // get all error reports
  public getErrorReports(): ErrorReport[] {
    return [...this.errorReports];
  }

  // clear error reports
  public clearErrorReports() {
    this.errorReports = [];
  }

  // update config
  public updateConfig(config: Partial<GlobalErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// create global instance
export const globalErrorHandler = new GlobalErrorHandler();

// export convenience methods
export const handleError = (error: Error, context?: ErrorContext) =>
  globalErrorHandler.handleError(error, context);

export const retryOperation = <T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  delay?: number,
  context?: ErrorContext,
) => globalErrorHandler.retry(operation, maxRetries, delay, context);

export const getErrorStats = () => globalErrorHandler.getErrorStats();
export const getErrorReports = () => globalErrorHandler.getErrorReports();
export const clearErrorReports = () => globalErrorHandler.clearErrorReports();

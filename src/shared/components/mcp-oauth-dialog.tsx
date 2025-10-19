import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui';
import {
  dispatchMcpOAuthEvent,
  type McpOAuthPopupRequestDetail,
  onMcpOAuthPopupRequest,
} from '@/shared/services/mcp-oauth-event';

export function McpOAuthDialogManager(): React.ReactNode | null {
  const [pendingRequest, setPendingRequest] =
    useState<McpOAuthPopupRequestDetail | null>(null);
  const closeReasonRef = useRef<'confirm' | 'cancel' | null>(null);
  const requestRef = useRef<McpOAuthPopupRequestDetail | null>(null);

  useEffect(() => {
    requestRef.current = pendingRequest;
  }, [pendingRequest]);

  useEffect(() => {
    const unsubscribe = onMcpOAuthPopupRequest((detail) => {
      setPendingRequest((current) => {
        if (current) {
          detail.reject(
            new Error('Another OAuth approval request is already pending'),
          );
          console.error(
            `Another authorization request is already in progress for ${current.resourceName || current.url}`,
          );
          return current;
        }
        return detail;
      });
    });

    return () => {
      unsubscribe();
      if (requestRef.current) {
        const error = new Error('OAuth authorization dismissed during cleanup');
        dispatchMcpOAuthEvent('mcp-oauth:error', {
          url: requestRef.current.url,
          resource: requestRef.current.resource,
          resourceName: requestRef.current.resourceName,
          error,
        });
        requestRef.current.reject(error);
        requestRef.current = null;
      }
    };
  }, []);

  const cleanupRequest = useCallback(() => {
    setPendingRequest(null);
    requestRef.current = null;
    closeReasonRef.current = null;
  }, []);

  const handleConfirm = useCallback(() => {
    const detail = requestRef.current;
    if (!detail) {
      cleanupRequest();
      return;
    }

    closeReasonRef.current = 'confirm';
    const popup = window.open(detail.authUrl, '_blank');

    if (!popup) {
      closeReasonRef.current = 'cancel';
      console.error(
        `Unable to open OAuth window for ${detail.resourceName || detail.url}. Please allow popups and try again.`,
      );
      const error = new Error('Failed to open OAuth window');
      dispatchMcpOAuthEvent('mcp-oauth:error', {
        url: detail.url,
        resource: detail.resource,
        resourceName: detail.resourceName,
        error,
      });
      detail.reject(error);
      cleanupRequest();
      return;
    }

    detail.confirm(popup);
    cleanupRequest();
  }, [cleanupRequest]);

  const handleCancel = useCallback(() => {
    const detail = requestRef.current;
    if (!detail) {
      cleanupRequest();
      return;
    }

    closeReasonRef.current = 'cancel';
    const error = new Error('OAuth authorization cancelled by user');
    dispatchMcpOAuthEvent('mcp-oauth:error', {
      url: detail.url,
      resource: detail.resource,
      resourceName: detail.resourceName,
      error,
    });
    detail.reject(error);
    cleanupRequest();
  }, [cleanupRequest]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        return;
      }

      const detail = requestRef.current;
      if (!detail) {
        cleanupRequest();
        return;
      }

      if (closeReasonRef.current) {
        return;
      }

      const error = new Error('OAuth authorization dismissed');
      dispatchMcpOAuthEvent('mcp-oauth:error', {
        url: detail.url,
        resource: detail.resource,
        resourceName: detail.resourceName,
        error,
      });
      detail.reject(error);
      cleanupRequest();
    },
    [cleanupRequest],
  );

  if (!pendingRequest) {
    return null;
  }

  return (
    <AlertDialog open={true} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Connection Request for{' '}
            {pendingRequest.resourceName || pendingRequest.url}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This Cap requires authenticated connection to{' '}
            <span className="font-bold">{pendingRequest.url}</span>. A new
            window will open to continue the flow.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

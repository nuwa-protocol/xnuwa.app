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
  type McpOAuthPopupRequestDetail,
  onMcpOAuthPopupRequest,
} from '@/shared/services/mcp-oauth';

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
        console.log(
          `Authorization requested for ${detail.resourceName || detail.url}`,
        );
        return detail;
      });
    });

    return () => {
      unsubscribe();
      if (requestRef.current) {
        requestRef.current.reject(
          new Error('OAuth authorization dismissed during cleanup'),
        );
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
      detail.reject(new Error('Failed to open OAuth window'));
      cleanupRequest();
      return;
    }

    detail.confirm(popup);
    console.log(
      `OAuth window opened for ${detail.resourceName || detail.url}.`,
    );
    cleanupRequest();
  }, [cleanupRequest]);

  const handleCancel = useCallback(() => {
    const detail = requestRef.current;
    if (!detail) {
      cleanupRequest();
      return;
    }

    closeReasonRef.current = 'cancel';
    detail.reject(new Error('OAuth authorization cancelled by user'));
    console.log(
      `Authorization cancelled for ${detail.resourceName || detail.url}.`,
    );
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

      detail.reject(new Error('OAuth authorization dismissed'));
      console.log(
        `Authorization dismissed for ${detail.resourceName || detail.url}.`,
      );
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
            Connection Request for {pendingRequest.resourceName || pendingRequest.url}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This Cap requires authenticated connection to <span className='font-bold'>{pendingRequest.url}</span>. A
            new window will open to continue the flow.
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

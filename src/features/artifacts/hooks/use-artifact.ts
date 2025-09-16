import { useChat } from '@ai-sdk/react';
import type { StreamAIRequest } from '@nuwa-ai/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useChatContext } from '@/features/chat/contexts/chat-context';
import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import type { ChildStreamMethods } from '@/shared/hooks/use-cap-ui-render';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { CurrentArtifactMCPToolsStore } from '@/shared/stores/current-artifact-store';
import { generateUUID } from '@/shared/utils';
import { ChatErrorCode, handleError } from '@/shared/utils/handl-error';
import { CreateAIStream } from '../services';
import { useArtifactsStore } from '../stores';

// Saving status for artifact state persistence
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useArtifact = (artifactId: string) => {
  const navigate = useNavigate();
  const { addSelectionToChatSession } = ChatSessionsStore();
  const { chat } = useChatContext();
  const { sendMessage, status } = useChat({ chat });
  const { getArtifact, updateArtifact } = useArtifactsStore();
  const { setTools, clearTools } = CurrentArtifactMCPToolsStore();
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);
  const streamMap = useRef(new Map<string, { aborted: boolean }>()); // track streams
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle'); // track saving status

  const handleSendPrompt = useCallback(
    (prompt: string) => {
      if (status === 'streaming' || status === 'submitted') {
        toast.warning(
          'Waiting for the model to finish processing the previous message...',
        );
        return;
      }
      sendMessage({ text: prompt });
    },
    [sendMessage, status],
  );

  const handleAddSelection = useCallback(
    (label: string, message: string) => {
      addSelectionToChatSession(chat.id, {
        id: generateUUID(),
        label,
        message,
      });
    },
    [chat, addSelectionToChatSession],
  );

  // Debounced persist function to avoid excessive writes
  const debouncedPersist = useDebounceCallback((state: any) => {
    try {
      updateArtifact(artifactId, { state });
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save artifact state', e);
      setSaveStatus('error');
    }
  }, 600);
  // Save state to store with debounce and expose a save status
  const handleSaveState = useCallback(
    (state: any) => {
      // Any incoming change indicates a pending save
      setSaveStatus('saving');
      debouncedPersist(state);
    },
    [debouncedPersist],
  );

  // Get state from store instead of localStorage
  const handleGetState = useCallback(() => {
    const currentArtifact = getArtifact(artifactId);
    return currentArtifact?.state || null;
  }, [artifactId, getArtifact]);

  // Set artifact mcp tools to the global store
  const handleMCPConnected = useCallback(
    (tools: Record<string, any>) => {
      setTools(tools);
    },
    [setTools],
  );

  // Handle mcp connection error
  const handleMCPConnectionError = useCallback(
    (error: Error) => {
      console.error('Artifact MCP connection error:', error);
      setHasConnectionError(true);
      clearTools();
    },
    [setHasConnectionError, clearTools],
  );

  // Handle penpal connection error
  const handlePenpalConnectionError = useCallback(
    (error: Error) => {
      console.error('Penpal connection error:', error);
      setHasConnectionError(true);
    },
    [setHasConnectionError],
  );

  // Handle stream request
  const handleStreamRequest = useCallback(
    async (
      request: StreamAIRequest,
      streamId: string,
      child: ChildStreamMethods,
    ) => {
      streamMap.current.set(streamId, { aborted: false });
      try {
        if (request.schema) {
          // TODO: Implement schema stream
          // const { partialObjectStream } = await CreateAIStream({
          //     artifactId,
          //     request,
          // });
          // for await (const partial of partialObjectStream as AsyncIterable<any>) {
          //     if (token.aborted) return;
          //     child.pushStreamChunk(streamId, {
          //         type: 'content',
          //         content: partial,
          //     });
          // }
        } else {
          const { textStream } = await CreateAIStream({
            artifactId,
            request,
          });
          for await (const textPart of textStream as AsyncIterable<string>) {
            if (streamMap.current.get(streamId)?.aborted) return;
            child.pushStreamChunk(streamId, {
              type: 'content',
              content: textPart,
            });
          }
        }
        if (!streamMap.current.get(streamId)?.aborted)
          child.completeStream(streamId);
      } catch (error) {
        child.pushStreamChunk(streamId, {
          type: 'content',
          content: `AI Stream Error: ${error}`,
        });
        child.errorStream(streamId, error as Error);
        const errorCode = handleError(error as Error);
        switch (errorCode) {
          case ChatErrorCode.IGNORED_ERROR:
            return;
          case ChatErrorCode.INSUFFICIENT_FUNDS:
            toast.warning('Insufficient funds', {
              description: 'Please top up your balance to continue',
              duration: 8000,
              action: {
                label: 'Go to Wallet',
                onClick: () => navigate('/wallet'),
              },
            });
            break;
          default:
            toast.error('An error occurred', {
              description: 'Please check your network connection and try again',
              action: {
                label: 'Retry',
                onClick: () =>
                  console.warn(
                    'Retry action needs to be handled by the component',
                  ),
              },
            });
        }
      } finally {
        streamMap.current.delete(streamId);
      }
    },
    [artifactId],
  );

  // Handle abort stream
  const handleAbortStream = useCallback((streamId: string) => {
    const t = streamMap.current.get(streamId);
    if (t) t.aborted = true;
  }, []);

  // Clear tools on unmount to avoid leaking session-scoped UI tools
  useEffect(() => {
    return () => {
      clearTools();
      // No need to cancel debounce explicitly - handled in hook
    };
  }, []);

  // Get artifact from store
  const artifact = getArtifact(artifactId);

  return {
    artifact,
    hasConnectionError,
    isProcessingAIRequest: streamMap.current.size > 0,
    saveStatus,
    handleSendPrompt,
    handleAddSelection,
    handleSaveState,
    handleGetState,
    handleMCPConnected,
    handleMCPConnectionError,
    handlePenpalConnectionError,
    handleStreamRequest,
    handleAbortStream,
  };
};

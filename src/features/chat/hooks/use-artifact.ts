import { useChat } from '@ai-sdk/react';
import type { StreamAIRequest } from '@nuwa-ai/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { LocalCap } from '@/features/cap-studio/types';
import { useChatContext } from '@/features/chat/contexts/chat-context';
import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import type { ChildMethods } from '@/shared/hooks/use-cap-ui-render';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap } from '@/shared/types';
import { generateUUID } from '@/shared/utils';
import { ChatErrorCode, handleError } from '@/shared/utils/handl-error';
import { CreateAIRequestStream } from '../services/stream-ai';

// Saving status for artifact state persistence
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Optional opts allow scoping the hook to a specific cap and controlling
// whether to register that cap's tools into the global CurrentCapStore.
export const useArtifact = (opts?: {
  cap?: Cap | LocalCap;
  registerTools?: boolean; // default true
}) => {
  const navigate = useNavigate();
  const {
    chatSessions,
    addSelectionToChatSession,
    updateChatSessionArtifactState,
    getChatSessionArtifactState,
  } = ChatSessionsStore();
  const { chat } = useChatContext();
  const { sendMessage, status } = useChat({ chat });
  const { setCurrentCapArtifactTools, clearCurrentCapArtifactTools } =
    CurrentCapStore();
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);
  const streamMap = useRef(new Map<string, { aborted: boolean }>()); // track streams
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle'); // track saving status
  const { currentCap } = CurrentCapStore();

  // Choose the cap provided by the caller when present, otherwise fall back to the current cap
  const capSource = opts?.cap ?? currentCap;
  // Underlying Cap object (for requests)
  const cap =
    capSource && ('capData' in capSource ? capSource.capData : capSource);
  // Stable key for per-cap artifact state within a chat session
  const capKey = capSource
    ? 'capData' in capSource
      ? `local:${capSource.id}`
      : `remote:${capSource.id}`
    : 'unknown';
  // Whether this instance should register its tools into the global store (default true)
  const shouldRegisterTools = opts?.registerTools !== false;
  // Keep last known MCP tools from this artifact instance
  const lastToolsRef = useRef<Record<string, any> | null>(null);

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
      updateChatSessionArtifactState(chat.id, capKey, state);
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save artifact state', e);
      setSaveStatus('error');
    }
  }, 1000);
  // Save state to store with debounce and expose a save status
  const handleSaveState = useCallback(
    (state: any) => {
      // don't store state until
      // 1. a conversation is started
      // 2. the cap is added to the chat session
      if (
        chatSessions[chat.id]?.messages?.length === 0 ||
        !chatSessions[chat.id]?.caps?.includes(cap as Cap | LocalCap)
      ) {
        return;
      }

      // Any incoming change indicates a pending save
      setSaveStatus('saving');
      debouncedPersist(state);
    },
    [debouncedPersist],
  );

  // Get state from store instead of localStorage
  const handleGetState = useCallback(() => {
    const state = getChatSessionArtifactState(chat.id, capKey);
    return state?.value || null;
  }, [chat.id, capKey, getChatSessionArtifactState]);

  // Set artifact mcp tools to the global store
  const handleMCPConnected = useCallback(
    (tools: Record<string, any>) => {
      // Cache tools locally for later re-registration if this cap becomes current
      lastToolsRef.current = tools;
      if (shouldRegisterTools) setCurrentCapArtifactTools(tools);
    },
    [setCurrentCapArtifactTools, shouldRegisterTools],
  );

  // Handle mcp connection error
  const handleMCPConnectionError = useCallback(
    (error: Error) => {
      console.error('Artifact MCP connection error:', error);
      setHasConnectionError(true);
      clearCurrentCapArtifactTools();
    },
    [setHasConnectionError, clearCurrentCapArtifactTools],
  );

  // Handle penpal connection error
  const handlePenpalConnectionError = useCallback(
    (error: Error) => {
      console.error('Penpal connection error:', error);
      setHasConnectionError(true);
    },
    [setHasConnectionError],
  );

  // TODO: handle MCP call

  // Handle stream request
  const handleStreamRequest = useCallback(
    async (request: StreamAIRequest, streamId: string, child: ChildMethods) => {
      if (!cap) {
        return;
      }
      streamMap.current.set(streamId, { aborted: false });
      try {
        const { textStream } = await CreateAIRequestStream({
          chatId: chat.id,
          prompt: request.prompt,
          cap: cap,
        });
        for await (const textPart of textStream as AsyncIterable<string>) {
          if (streamMap.current.get(streamId)?.aborted) return;
          child.pushStreamChunk(streamId, {
            type: 'content',
            content: textPart,
          });
        }
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
    [chat.id],
  );

  // Handle abort stream
  const handleAbortStream = useCallback((streamId: string) => {
    const t = streamMap.current.get(streamId);
    if (t) t.aborted = true;
  }, []);

  // Clear tools on unmount to avoid leaking session-scoped UI tools
  useEffect(() => {
    return () => {
      // Only clear tools if this instance registered them
      if (shouldRegisterTools) {
        clearCurrentCapArtifactTools();
      }
    };
  }, [shouldRegisterTools]);

  return {
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
    lastToolsRef,
  };
};

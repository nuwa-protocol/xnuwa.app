import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { generateUUID } from '@/shared/utils';
import { createClientAIFetch } from '../services';
import { createInitialChatSession } from '../stores';
import { convertToUIMessage } from '../utils';
import { ChatErrorCode, handleError } from '../utils/handl-error';
import { useChatSessions } from './use-chat-sessions';
import { useUpdateChatTitle } from './use-update-chat-title';

/**
 * Unified chat manager - single source of truth for all chat operations
 * Uses chatId as the primary handle for all operations
 */
export const useChatManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addCurrentCapsToChat, getSession, sessionsMap } = useChatSessions();

  // Get chatId from URL, or generate a new one for new chats
  const urlChatId = searchParams.get('cid');
  const chatIdRef = useRef<string>(urlChatId || generateUUID());

  // Keep track if this is a new chat (no cid in URL initially)
  const isNewChatRef = useRef<boolean>(!urlChatId);

  // Update chatId when URL changes
  useEffect(() => {
    if (!urlChatId) {
      // No cid in URL - this is a new chat, generate new ID
      const newChatId = generateUUID();
      chatIdRef.current = newChatId;
      isNewChatRef.current = true;
    } else if (urlChatId !== chatIdRef.current) {
      // URL changed to a different existing chat
      chatIdRef.current = urlChatId;
      isNewChatRef.current = false;
    }
  }, [urlChatId]);

  const currentChatId = chatIdRef.current;
  const { updateTitle } = useUpdateChatTitle();

  // Get session data - use empty array for new chats to prevent re-initialization
  const existingSession =
    currentChatId && sessionsMap[currentChatId]
      ? sessionsMap[currentChatId]
      : null;
  const initialMessages = existingSession
    ? existingSession.messages.map(convertToUIMessage)
    : [];

  const handleUseChatError = (error: Error) => {
    const errorCode = handleError(error);
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
            onClick: () => chatState.regenerate(),
          },
        });
    }
  };

  const handleOnData = (data: any) => {
    // console.log('handleOnData called with:', data);
    if (data.type !== 'data-mark') return;

    if (data.data === 'onResponse') {
      // console.log('onResponse triggered, updating title and caps');
      // Update title and add caps when streaming starts
      updateTitle(currentChatId);
      addCurrentCapsToChat(currentChatId);
    }
  };

  const handleOnFinish = () => {
    // Navigate to the chat with ID after streaming completes (for new chats)
    if (isNewChatRef.current) {
      navigate(`/chat?cid=${currentChatId}`, { replace: true });
      isNewChatRef.current = false;
    }

    // Optional: Show completion toast for background chats
    const currentUrlChatId = new URLSearchParams(window.location.search).get(
      'cid',
    );
    if (currentUrlChatId !== currentChatId) {
      const session = getSession(currentChatId);
      toast.success(
        `Your chat ${session ? `"${session.title}"` : ''} is completed`,
        {
          action: {
            label: 'View Chat',
            onClick: () => navigate(`/chat?cid=${currentChatId}`),
          },
        },
      );
    }
  };

  const chatState = useChat({
    id: currentChatId,
    messages: initialMessages,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      fetch: createClientAIFetch(),
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: { id, messages },
      }),
    }),
    onError: handleUseChatError,
    onFinish: handleOnFinish,
    onData: handleOnData,
  });

  // Unified interface
  return {
    // Core state
    chatId: currentChatId,
    chatSession: existingSession || createInitialChatSession(currentChatId),
    messages: chatState.messages,
    status: chatState.status,

    // Actions
    sendMessage: chatState.sendMessage,
    setMessages: chatState.setMessages,
    regenerate: chatState.regenerate,
    stop: chatState.stop,
  };
};

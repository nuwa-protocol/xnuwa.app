import { Chat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { generateUUID } from '@/shared/utils';
import { useChatSessions } from '../hooks/use-chat-sessions';
import { useUpdateChatTitle } from '../hooks/use-update-chat-title';
import { createClientAIFetch } from '../services';
import { convertToUIMessage } from '../utils';
import { ChatErrorCode, handleError } from '../utils/handl-error';

// Global cache outside component to prevent clearing on re-renders
const globalChatInstances = new Map<string, Chat<UIMessage>>();
let globalNewChatId: string | null = null;

interface ChatContextValue {
  chat: Chat<UIMessage>;
  chatId: string;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addCurrentCapsToChat, getSession, sessionsMap } = useChatSessions();
  const { updateTitle } = useUpdateChatTitle();

  // Get chatId from URL, or generate a new one for new chats
  const cid = searchParams.get('cid');

  // Store the current chat ID for navigation logic
  const chatIdRef = useRef<string | null>(null);
  // Track if we're in the middle of navigation to avoid unnecessary recreations
  const isNavigatingRef = useRef(false);

  // Create and manage Chat instance
  const chat = useMemo(
    () => {
      // Get or generate stable chat ID
      let currentChatId: string;
      if (cid) {
        // If we have a cid and it matches our generated new chat ID, we're navigating
        if (globalNewChatId === cid) {
          console.log(
            'detected navigation from new chat to existing chat with id: ',
            cid,
          );
          isNavigatingRef.current = true;
          // DON'T clear globalNewChatId here - keep it for reference
        }
        currentChatId = cid;
      } else {
        // Use existing generated ID or create new one for new chat
        if (!globalNewChatId) {
          globalNewChatId = generateUUID();
          console.log('generated new chat id: ', globalNewChatId);
        }
        currentChatId = globalNewChatId;
      }

      // ALWAYS check cache first, even before any other logic
      const existingInstance = globalChatInstances.get(currentChatId);
      if (existingInstance) {
        console.log('reusing existing chat instance with id: ', currentChatId);
        chatIdRef.current = currentChatId;
        // Reset navigation flag after reusing
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
        }
        return existingInstance;
      }

      // Only create new instance if one doesn't exist
      console.log('creating new chat instance with id: ', currentChatId);

      // Store the current chat ID for navigation logic
      chatIdRef.current = currentChatId;
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
                onClick: () => {
                  // Note: regenerate will be available on the chat instance
                  console.warn(
                    'Retry action needs to be handled by the component',
                  );
                },
              },
            });
        }
      };

      const handleOnData = (data: any) => {
        if (data.type !== 'data-mark') return;

        if (data.data === 'onResponse') {
          // Update title and add caps when streaming starts
          updateTitle(currentChatId);
          addCurrentCapsToChat(currentChatId);
        }
      };

      const handleOnFinish = () => {
        // Optional: Show completion toast for background chats
        const currentUrlChatId = new URLSearchParams(
          window.location.search,
        ).get('cid');
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

      const newChatInstance = new Chat({
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

      // Store the new instance in our cache IMMEDIATELY after creation
      globalChatInstances.set(currentChatId, newChatInstance);

      return newChatInstance;
    },
    [cid, sessionsMap], // Add sessionsMap to dependencies to handle session changes
  );

  // Handle navigation from new chat to existing chat
  useEffect(() => {
    // If we're on a new chat page (no cid) and we have a generated chat ID
    if (!cid && globalNewChatId && chat.id === globalNewChatId) {
      // Only navigate when we actually start chatting (have messages)
      const existingSession = sessionsMap[chat.id];
      if (existingSession && existingSession.messages.length > 0) {
        console.log('navigating from new chat to chat page with id: ', chat.id);
        // Set navigation flag before navigating
        isNavigatingRef.current = true;
        navigate(`/chat?cid=${chat.id}`, { replace: true });
      }
    }

    // Clear globalNewChatId when we're on a specific chat page and navigation is complete
    if (cid && globalNewChatId === cid && !isNavigatingRef.current) {
      console.log(
        'clearing globalNewChatId after successful navigation to: ',
        cid,
      );
      globalNewChatId = null;
    }
  }, [cid, chat.id, navigate, sessionsMap]);

  const value: ChatContextValue = {
    chat,
    chatId: chat.id,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

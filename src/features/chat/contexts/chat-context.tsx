import { Chat, useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { generateUUID } from '@/shared/utils';
import { useUpdateChatTitle } from '../hooks/use-update-chat-title';
import { createClientAIFetch } from '../services';
import { ChatSessionsStore } from '../stores';
import { convertToUIMessage } from '../utils';
import { ChatErrorCode, handleError } from '../utils/handl-error';

// Global cache outside component to prevent clearing on re-renders
const globalChatInstances = new Map<string, Chat<UIMessage>>();
let globalNewChatId: string | null = null;

interface ChatContextValue {
  chatState: ReturnType<typeof useChat>;
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
  const { getChatSession, chatSessions, updateSession } = ChatSessionsStore();
  const { updateTitle } = useUpdateChatTitle();
  const { currentCap } = useCurrentCap();

  const addCurrentCapsToChat = async (chatId: string) => {
    const currentSession = getChatSession(chatId);
    if (!currentSession) return;
    if (!currentCap) return;

    if (currentSession.caps.some((c) => c.id === currentCap.id)) return;

    await updateSession(chatId, {
      caps: [...currentSession.caps, currentCap],
    });
  };

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
          isNavigatingRef.current = true;
          // DON'T clear globalNewChatId here - keep it for reference
        }
        currentChatId = cid;
      } else {
        // Use existing generated ID or create new one for new chat
        if (!globalNewChatId) {
          globalNewChatId = generateUUID();
        }
        currentChatId = globalNewChatId;
      }

      // ALWAYS check cache first, even before any other logic
      const existingInstance = globalChatInstances.get(currentChatId);
      if (existingInstance) {
        chatIdRef.current = currentChatId;
        // Reset navigation flag after reusing
        if (isNavigatingRef.current) {
          isNavigatingRef.current = false;
        }
        return existingInstance;
      }

      // Only create new instance if one doesn't exist

      // Store the current chat ID for navigation logic
      chatIdRef.current = currentChatId;
      // Get session data - use empty array for new chats to prevent re-initialization
      const existingSession =
        currentChatId && chatSessions[currentChatId]
          ? chatSessions[currentChatId]
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
        if (currentUrlChatId !== currentChatId && !chat.error) {
          const session = getChatSession(currentChatId);
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
    [cid, chatSessions], // Add sessionsMap to dependencies to handle session changes
  );

  // Handle navigation from new chat to existing chat
  useEffect(() => {
    // If we're on a new chat page (no cid) and we have a generated chat ID
    if (!cid && globalNewChatId && chat.id === globalNewChatId) {
      // Only navigate when we actually start chatting (have messages)
      const existingSession = chatSessions[chat.id];
      if (existingSession && existingSession.messages.length > 0) {
        // Set navigation flag before navigating
        isNavigatingRef.current = true;
        navigate(`/chat?cid=${chat.id}`, { replace: true });
      }
    }

    // Clear globalNewChatId when we're on a specific chat page and navigation is complete
    if (cid && globalNewChatId === cid && !isNavigatingRef.current) {
      globalNewChatId = null;
    }
  }, [cid, chat.id, navigate, chatSessions]);

  const value: ChatContextValue = {
    chatState: useChat({ chat }),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

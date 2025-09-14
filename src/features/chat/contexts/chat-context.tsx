import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateUUID } from '@/shared/utils';
import { useChatInstance } from '../hooks';
import { ChatSessionsStore } from '../stores';

interface ChatContextValue {
  chat: ReturnType<typeof useChatInstance>;
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
  const { chatSessions } = ChatSessionsStore();
  const isNavigatingRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlChatId = searchParams.get('chat_id');
  const newChatIdRef = useRef<string | null>(null);
  const chatId = useMemo(() => {
    if (urlChatId) {
      return urlChatId;
    }
    if (newChatIdRef.current) {
      return newChatIdRef.current;
    }
    newChatIdRef.current = generateUUID()
    return newChatIdRef.current;
  }, [urlChatId, newChatIdRef]);

  // Handle navigation from new chat to permanent URL when messages exist
  useEffect(() => {
    if (!urlChatId) {
      const session = chatSessions[chatId];
      if (session && session.messages.length > 0 && !isNavigatingRef.current) {
        isNavigatingRef.current = true;
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('chat_id', chatId);
        setSearchParams(newSearchParams);
      }
    }

    // Clean up new chat ID ref when navigating to specific chat
    if (urlChatId && newChatIdRef.current === urlChatId) {
      newChatIdRef.current = null;
      isNavigatingRef.current = false;
    }
  }, [urlChatId, chatId, chatSessions, navigate]);

  // Get chat instance
  const chat = useChatInstance(chatId);

  const value: ChatContextValue = {
    chat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

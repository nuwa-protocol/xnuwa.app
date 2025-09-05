import { useChat } from '@ai-sdk/react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateUUID } from '@/shared/utils';
import { useChatInstance } from '../hooks';
import { ChatSessionsStore } from '../stores';

interface ChatContextValue {
  chatState: ReturnType<typeof useChat>;
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
  const { chatSessions } = ChatSessionsStore();
  const newChatIdRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false);
  const [chatId, setChatId] = useState<string>(generateUUID());

  // Get chat ID from URL
  const urlChatId = searchParams.get('cid');

  useEffect(() => {
    if (urlChatId) {
      setChatId(urlChatId);
    } else {
      setChatId(generateUUID());
    }
  }, [urlChatId]);

  // Handle navigation from new chat to permanent URL when messages exist
  useEffect(() => {
    if (!urlChatId && chatId && newChatIdRef.current === chatId) {
      const session = chatSessions[chatId];
      if (session && session.messages.length > 0 && !isNavigatingRef.current) {
        isNavigatingRef.current = true;
        navigate(`/chat?cid=${chatId}`, { replace: true });
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
    chatState: useChat({ chat }), // return useChat state with the chat instance
    chatId: chatId,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

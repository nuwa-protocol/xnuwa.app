import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const { chatSessions } = ChatSessionsStore();
  const newChatIdRef = useRef<string | null>(null);
  const isNavigatingRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get chat ID from URL
  const urlChatId = searchParams.get('cid');

  // Initialize chat ID - only generate new UUID if there's no URL param and no existing ID
  const [chatId, setChatId] = useState<string>(() => {
    if (urlChatId) {
      return urlChatId;
    }
    // Generate a new ID for the session, but keep it stable
    const newId = generateUUID();
    newChatIdRef.current = newId;
    return newId;
  });

  useEffect(() => {
    if (urlChatId) {
      setChatId(urlChatId);
      // Clear the new chat ref if we're navigating to a specific chat
      if (newChatIdRef.current === urlChatId) {
        newChatIdRef.current = null;
      }
    }
    // Don't generate a new ID when urlChatId is null - keep the existing one
  }, [urlChatId]);

  // Handle navigation from new chat to permanent URL when messages exist
  useEffect(() => {
    if (!urlChatId && chatId && newChatIdRef.current === chatId) {
      const session = chatSessions[chatId];
      if (session && session.messages.length > 0 && !isNavigatingRef.current) {
        isNavigatingRef.current = true;
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('cid', chatId);
        setSearchParams(newSearchParams);
        // Reset the navigation flag after setting params
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 100);
      }
    }
  }, [urlChatId, chatId, chatSessions, searchParams, setSearchParams]);

  // Get chat instance
  const chat = useChatInstance(chatId);

  const value: ChatContextValue = {
    chat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

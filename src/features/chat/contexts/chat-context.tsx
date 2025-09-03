import type { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { useChatManager } from '../hooks/use-chat-manager';
import type { ChatSession } from '../types';

interface ChatContextValue {
  // Chat state
  messages: UIMessage[];
  input: string;
  status: ReturnType<typeof useChat>['status'];
  chatId: string;
  chatSession: ChatSession;

  // Chat actions
  setMessages: ReturnType<typeof useChat>['setMessages'];
  setInput: (input: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  sendMessage: ReturnType<typeof useChat>['sendMessage'];
  regenerate: ReturnType<typeof useChat>['regenerate'];
  stop: () => void;

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
  const [input, setInput] = useState('');
  const chatManager = useChatManager();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      chatManager.sendMessage({ text: input });
      setInput('');
    }
  };

  const value: ChatContextValue = {
    // State from chat manager
    messages: chatManager.messages,
    status: chatManager.status,
    chatId: chatManager.chatId,
    chatSession: chatManager.chatSession,

    // Local input state
    input,
    setInput,

    // Actions
    handleSubmit,
    sendMessage: chatManager.sendMessage,
    setMessages: chatManager.setMessages,
    regenerate: chatManager.regenerate,
    stop: chatManager.stop,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

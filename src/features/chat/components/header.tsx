import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapSelector } from '@/features/cap-store/components';
import { fetchTransactionsFromChatSession } from '@/features/wallet/service';
import type { PaymentTransaction } from '@/features/wallet/types';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { generateUUID } from '@/shared/utils';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores';
import { ChatDropdownMenu } from './chat-dropdown-menu';
import { ContextCostIndicator } from './context-cost-indicator';

interface HeaderProps {
  chatId: string;
}

export default function Header({ chatId }: HeaderProps) {
  const navigate = useNavigate();
  const { chatSessions, updateSession, deleteSession, updateMessages } =
    ChatSessionsStore();
  const [paymentInfo, setPaymentInfo] = useState<{
    transactions: PaymentTransaction[];
    totalAmount: bigint;
  } | null>(null);
  const session = chatSessions[chatId || ''] || null;
  const title = session?.title || 'New Chat';
  const { chat } = useChatContext();
  const { setMessages } = useChat({ chat });
  const { currentCap } = CurrentCapStore();

  const handleRename = async (newTitle: string) => {
    await updateSession(chatId, { title: newTitle });
  };

  const handleClearConversation = async () => {
    // add a clear context message seperator to the conversation messages
    setMessages((messages) => {
      // if already have clear context message, do nothing
      if (
        messages[messages.length - 1].role === 'system' &&
        messages[messages.length - 1].parts?.some(
          (part) =>
            part.type === 'data-uimark' && part.data === 'clear-context',
        )
      ) {
        return messages;
      }
      // if not have clear context message, add it
      const contextSeperatorMessage = {
        id: generateUUID(),
        role: 'system' as const,
        parts: [
          {
            type: 'data-uimark' as const,
            data: 'clear-context',
          },
        ],
      };
      const updatedMessages = [...messages, contextSeperatorMessage];
      updateMessages(chatId, updatedMessages);
      return updatedMessages;
    });

    // clear the context usage
    updateSession(chatId, {
      contextUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
        cachedInputTokens: 0,
      }
    });
  };

  const handleDeleteConversation = async () => {
    await deleteSession(chatId);
    navigate('/chat');
  };

  const handleTogglePin = () => {
    if (session) {
      updateSession(chatId, { pinned: !session.pinned });
    }
  };

  useEffect(() => {
    const getPaymentInfo = async () => {
      const transactions = await fetchTransactionsFromChatSession(session);
      const totalAmount = transactions.reduce(
        (sum, tx) => sum + (tx.details?.payment?.costUsd || 0n),
        0n,
      );
      setPaymentInfo({
        transactions,
        totalAmount,
      });
    };
    getPaymentInfo();
  }, [session]);

  const contextLength = currentCap.core.model.contextLength;

  return (
    <header className="sticky top-0 z-10 grid grid-cols-3 items-center bg-background/10 px-3 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/10">
      {/* Left: Actions */}
      <div className="flex items-center gap-1.5">
        <CapSelector />
      </div>
      {/* Center: Status area (AI or Save) */}
      <div className="flex flex-row justify-center items-center w-full">
        <div className="flex flex-row justify-center items-center gap-2">
          <p className="text-center text-sm py-1 rounded-lg font-medium text-foreground/90 md:text-base line-clamp-1">
            {title}
          </p>
          {session && (
            <ChatDropdownMenu
              session={session}
              onRename={handleRename}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteConversation}
            />
          )}
        </div>
      </div>
      {/* Right: Context and Cost Indicator */}
      <div className="justify-self-end px-2">
        <ContextCostIndicator
          contextUsage={session?.contextUsage}
          contextLength={contextLength}
          paymentInfo={paymentInfo}
          onClearContext={handleClearConversation}
        />
      </div>
    </header>
  );
}

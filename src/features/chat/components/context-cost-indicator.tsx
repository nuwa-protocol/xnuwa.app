import { useChat } from '@ai-sdk/react';
import { BrushCleaning } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTransactionsFromChatSession } from '@/features/wallet/services';
import type { PaymentTransaction } from '@/features/wallet/types';
import { formatUsdCost } from '@/features/wallet/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { generateUUID } from '@/shared/utils';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';

export function ContextCostIndicator() {
  const navigate = useNavigate();
  const { chatSessions, updateSession, updateMessages } = ChatSessionsStore();
  const [paymentInfo, setPaymentInfo] = useState<{
    transactions: PaymentTransaction[];
    totalAmount: bigint;
  } | null>(null);

  const { chat } = useChatContext();
  const { setMessages } = useChat({ chat });
  const { getCurrentCap } = CurrentCapStore();
  const cap = getCurrentCap();

  const session = chatSessions[chat.id || ''] || null;
  const contextUsage = session?.contextUsage;
  const contextLength = cap?.core.model.contextLength || 0;

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
      updateMessages(chat.id, updatedMessages);
      return updatedMessages;
    });

    // clear the context usage
    updateSession(chat.id, {
      contextUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
        cachedInputTokens: 0,
      },
    });
  };

  const contextPercentage = contextUsage?.totalTokens
    ? Math.round((contextUsage.totalTokens / contextLength) * 100)
    : 0;

  const totalCost = formatUsdCost(paymentInfo?.totalAmount || 0n) || '$0.00';
  const totalCostShort = `${totalCost?.split('.')[0] || '0'}.${totalCost?.split('.')[1]?.slice(0, 2) || '00'}`;

  if (!contextUsage && !paymentInfo?.totalAmount) {
    return null;
  }

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-3 rounded-lg relative overflow-hidden"
        >
          {/* Background progress bar */}
          <div
            className={`absolute inset-0 transition-all duration-300 ${contextPercentage > 80
              ? 'bg-red-500/20'
              : contextPercentage > 60
                ? 'bg-yellow-500/20'
                : 'bg-green-500/20'
              }`}
          />
          {/* Progress fill */}
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-300 ${contextPercentage > 80
              ? 'bg-red-500/40'
              : contextPercentage > 60
                ? 'bg-yellow-500/40'
                : 'bg-green-500/40'
              }`}
            style={{ width: `${Math.min(contextPercentage, 100)}%` }}
          />
          {/* Content */}
          <div className="relative flex items-center">
            <span className="text-md font-medium">{totalCostShort}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0">
        <div className="px-6 pt-6">
          {/* Context Usage Section */}
          {contextUsage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Context Usage
                </h3>
                <div className="text-sm font-medium text-muted-foreground">
                  {contextUsage.totalTokens?.toLocaleString()} /{' '}
                  {contextLength?.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${contextPercentage > 80
                      ? 'bg-red-500'
                      : contextPercentage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min(contextPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Input Tokens
                  </div>
                  <div className="text-sm font-semibold">
                    {contextUsage.inputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Output Tokens
                  </div>
                  <div className="text-sm font-semibold">
                    {contextUsage.outputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Reasoning
                  </div>
                  <div className="text-sm font-semibold">
                    {contextUsage.reasoningTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Cached
                  </div>
                  <div className="text-sm font-semibold">
                    {contextUsage.cachedInputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clear Context Section */}
          <div className="py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearConversation}
              className="w-full h-10 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 transition-all duration-200"
            >
              <BrushCleaning className="h-4 w-4 mr-2" />
              <span className="font-medium">Clear Conversation Context</span>
            </Button>
          </div>

          {/* Separator */}
          <div className="border-t" />
        </div>

        {/* Total Cost Section */}
        <Button
          variant="ghost"
          className="w-full px-6 my-3"
          onClick={handleWalletClick}
        >
          <div className="w-full justify-between rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Total Cost
              </h3>
              <div className="text-sm font-medium text-muted-foreground">
                {totalCost}
              </div>
            </div>
          </div>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

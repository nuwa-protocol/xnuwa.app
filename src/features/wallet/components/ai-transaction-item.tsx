import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import type {
  ChatSessionTransactionRecords,
  PaymentTransaction,
} from '../types';
import { formatUsdCost } from '../utils';
import { AITransactionSubItem } from './ai-transaction-sub-item';

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const getTotalCost = (transactions: PaymentTransaction[]) => {
  const total = transactions.reduce(
    (sum, tx) => sum + (tx.details?.payment?.costUsd || 0n),
    0n,
  );
  return formatUsdCost(total);
};

interface ChatHistoryItemProps {
  chatRecord: ChatSessionTransactionRecords;
  isOpen: boolean;
  onToggle: (chatId: string) => void;
  onSelectTransaction: (transaction: PaymentTransaction) => void;
}

export function AITransactionItem({
  chatRecord,
  isOpen,
  onToggle,
  onSelectTransaction,
}: ChatHistoryItemProps) {
  if (!chatRecord.chatId || chatRecord.transactions.length === 0) return null;

  const chatId = chatRecord.chatId;
  const totalCost = getTotalCost(chatRecord.transactions);
  const chatTime =
    chatRecord.transactions.length > 0
      ? Math.max(
        ...chatRecord.transactions.map((tx) => tx.details?.timestamp || 0),
      )
      : 0;
  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle(chatId)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        >
          <div className="text-left">
            <p className="font-medium truncate max-w-[200px]">
              {chatRecord.chatTitle || 'Untitled Chat'}
            </p>
            <p className="text-xs text-muted-foreground">
              {chatTime > 0 ? formatDate(chatTime) : 'No date'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-1 text-sm font-medium">
                <span>{totalCost || '$0.00'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {chatRecord.transactions.length} transaction
                {chatRecord.transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
            {isOpen ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-7 pr-4 pb-2">
        <div className="space-y-2 border-l border-muted-foreground/50 pl-4">
          {chatRecord.transactions.map((transaction, index) => (
            <AITransactionSubItem
              key={transaction.ctxId}
              index={index}
              transaction={transaction}
              onSelect={onSelectTransaction}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

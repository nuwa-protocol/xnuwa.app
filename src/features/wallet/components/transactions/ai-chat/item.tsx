import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  ChatSessionTransactionRecords,
  PaymentTransaction,
} from '@/features/wallet/types';
import { formatUsdCost } from '@/features/wallet/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { AITransactionSubItem } from './sub-item';

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// Support both legacy and new record shapes
function isLegacy(details: any): details is { payment?: { costUsd?: bigint } } {
  return !!details && typeof details === 'object' && 'payment' in details;
}

const pow10 = (exp: number): bigint => {
  if (exp <= 0) return 1n;
  return 10n ** BigInt(exp);
};

const getAssetDecimals = (details: any): number => {
  const dec = details?.requirement?.extra?.assetDecimals;
  return Number.isInteger(dec) ? Number(dec) : 6;
};

const toPicoUsd = (details: any | null | undefined): bigint => {
  if (!details) return 0n;
  if (isLegacy(details)) {
    const v = details.payment?.costUsd;
    return v === undefined || v === null ? 0n : BigInt(String(v));
    }
  const raw = details?.requirement?.maxAmountRequired;
  if (raw === undefined || raw === null) return 0n;
  const amount = BigInt(String(raw));
  const decimals = getAssetDecimals(details);
  if (decimals === 12) return amount;
  if (decimals > 12) return amount / pow10(decimals - 12);
  return amount * pow10(12 - decimals);
};

const getTotalCost = (transactions: PaymentTransaction[]) => {
  const total = transactions.reduce((sum, tx) => sum + toPicoUsd(tx.details), 0n);
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
  // Fall back to chat message timestamp as source of time
  const chatTime =
    chatRecord.transactions.length > 0
      ? Math.max(...chatRecord.transactions.map((tx) => tx.info.timestamp || 0))
      : 0;
  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggle(chatId)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between py-4 h-auto hover:bg-muted/50"
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
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
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

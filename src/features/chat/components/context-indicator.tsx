import { useChat } from '@ai-sdk/react';
import { BrushCleaning } from 'lucide-react';
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTransactionsFromChatSession } from '@/features/wallet/services';
import { formatUsdCost } from '@/features/wallet/utils';
import { Button } from '@/shared/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shared/components/ui/hover-card';
import { Progress } from '@/shared/components/ui/progress';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { generateUUID } from '@/shared/utils';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';

type PaymentInfo = {
  totalAmount: bigint;
  toolCallAmount: bigint;
};

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

export function ContextIndicator() {
  const navigate = useNavigate();
  const { chat } = useChatContext();
  const { setMessages } = useChat({ chat });
  const { chatSessions, updateSession, updateMessages } = ChatSessionsStore();
  const { getCurrentCap } = CurrentCapStore();
  const cap = getCurrentCap();

  const session = chatSessions[chat.id || ''] || null;
  const contextUsage = session?.contextUsage;
  const maxTokens = cap?.core.model.contextLength ?? 0;
  const safeMaxTokens = maxTokens > 0 ? maxTokens : 1;

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    const getPaymentInfo = async () => {
      if (!session) {
        if (isMounted) {
          setPaymentInfo(null);
        }
        return;
      }

      try {
        const transactions = await fetchTransactionsFromChatSession(session);
        if (!isMounted) return;

        const { totalAmount, toolCallAmount } = transactions.reduce(
          (acc, tx) => {
            const amount = toPicoUsd(tx.details);
            return {
              totalAmount: acc.totalAmount + amount,
              toolCallAmount:
                tx.info.type === 'tool-call'
                  ? acc.toolCallAmount + amount
                  : acc.toolCallAmount,
            };
          },
          { totalAmount: 0n, toolCallAmount: 0n },
        );

        setPaymentInfo({
          totalAmount,
          toolCallAmount,
        });
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setPaymentInfo({
            totalAmount: 0n,
            toolCallAmount: 0n,
          });
        }
      }
    };

    void getPaymentInfo();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleClearConversation = useCallback(() => {
    setMessages((messages) => {
      if (
        messages[messages.length - 1]?.role === 'system' &&
        messages[messages.length - 1]?.parts?.some(
          (part) =>
            part.type === 'data-uimark' && part.data === 'clear-context',
        )
      ) {
        return messages;
      }

      const contextSeparatorMessage = {
        id: generateUUID(),
        role: 'system' as const,
        parts: [
          {
            type: 'data-uimark' as const,
            data: 'clear-context',
          },
        ],
      };

      const updatedMessages = [...messages, contextSeparatorMessage];
      updateMessages(chat.id, updatedMessages);
      return updatedMessages;
    });

    updateSession(chat.id, {
      contextUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
        cachedInputTokens: 0,
      },
    });
  }, [chat.id, setMessages, updateMessages, updateSession]);

  const handleWalletClick = useCallback(() => {
    navigate('/wallet');
  }, [navigate]);

  const totalCostDisplay = useMemo(
    () => formatCostDisplay(paymentInfo?.totalAmount),
    [paymentInfo?.totalAmount],
  );

  const hasToolCallCost = Boolean(paymentInfo?.toolCallAmount && paymentInfo?.toolCallAmount > 0);

  const toolCallCostDisplay = useMemo(
    () => formatCostDisplay(paymentInfo?.toolCallAmount),
    [paymentInfo?.toolCallAmount],
  );

  const usedTokens = contextUsage?.totalTokens ?? 0;
  const shouldRender =
    Boolean(contextUsage) || Boolean(paymentInfo?.totalAmount);

  if (!shouldRender) {
    return null;
  }

  return (
    <HoverCard closeDelay={0} openDelay={0}>
      <HoverCardTrigger asChild>
        <Button
          aria-label={`Context usage ${formatPercent(usedTokens, safeMaxTokens)}`}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ContextUsageIcon maxTokens={safeMaxTokens} usedTokens={usedTokens} />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        className="min-w-[240px] divide-y overflow-hidden p-0"
      >
        <UsageHeader maxTokens={safeMaxTokens} usedTokens={usedTokens} />
        <div className="w-full space-y-4 p-3">
          <div className="space-y-2">
            <UsageRow label="Input" tokens={contextUsage?.inputTokens} />
            <UsageRow label="Output" tokens={contextUsage?.outputTokens} />
            <UsageRow
              label="Reasoning"
              tokens={contextUsage?.reasoningTokens}
            />
            <UsageRow
              label="Cache"
              tokens={contextUsage?.cachedInputTokens}
            />
            {hasToolCallCost && (
              <UsageRow
                label="Tool call cost"
                cost={toolCallCostDisplay}
              />
            )}
          </div>
          <Button
            className="w-full justify-center"
            onClick={handleClearConversation}
            size="sm"
            type="button"
            variant="outline"
          >
            <BrushCleaning className="mr-2 h-4 w-4" />
            Clear conversation context
          </Button>
        </div>
        <CostRow
          costText={totalCostDisplay}
          label="Total cost"
          onSelect={handleWalletClick}
        />
      </HoverCardContent>
    </HoverCard>
  );
}

const ContextUsageIcon = ({
  usedTokens,
  maxTokens,
}: {
  usedTokens: number;
  maxTokens: number;
}) => {
  const circumference = 2 * Math.PI * ICON_RADIUS;
  const usedPercent = maxTokens > 0 ? Math.min(usedTokens / maxTokens, 1) : 0;
  const dashOffset = circumference * (1 - usedPercent);

  return (
    <svg
      aria-hidden="true"
      height="20"
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
};

const UsageHeader = ({
  usedTokens,
  maxTokens,
}: {
  usedTokens: number;
  maxTokens: number;
}) => {
  const percentText = formatPercent(usedTokens, maxTokens);
  const usedFormatted = formatCompact(usedTokens);
  const totalFormatted = formatCompact(maxTokens);
  const usedPercent = maxTokens > 0 ? Math.min(usedTokens / maxTokens, 1) : 0;

  return (
    <div className="w-full space-y-2 p-3 text-xs">
      <div className="flex items-center justify-between gap-3">
        <p>{percentText}</p>
        <p className="font-mono text-muted-foreground">
          {usedFormatted} / {totalFormatted}
        </p>
      </div>
      <div className="space-y-2">
        <Progress className="h-2 bg-muted" value={usedPercent * PERCENT_MAX} />
      </div>
    </div>
  );
};

const UsageRow = ({
  label,
  tokens,
  cost
}: {
  label: string;
  tokens?: number | null;
  cost?: string | null;
}) => {
  if (!tokens && !cost) {
    return null;
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span>{cost ?? formatCompact(tokens ?? 0)}</span>
    </div>
  );
};

const CostRow = ({
  label,
  costText,
  onSelect,
}: {
  label: string;
  costText: string;
  onSelect: () => void;
}) => (
  <div
    className="flex w-full cursor-pointer items-center justify-between gap-3 bg-secondary p-3 text-xs transition-colors hover:bg-secondary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    onClick={onSelect}
    onKeyDown={(event) => handleInteractiveKey(event, onSelect)}
    role="button"
    tabIndex={0}
  >
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{costText}</span>
  </div>
);

const handleInteractiveKey = (
  event: KeyboardEvent<HTMLDivElement>,
  onActivate: () => void,
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
};

const formatPercent = (used: number, max: number) => {
  const percent = max > 0 ? Math.min(used / max, 1) : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(percent);
};

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(value);

const formatCostDisplay = (amount?: bigint | null) => {
  const formatted = formatUsdCost(amount || 0n);
  if (!formatted) {
    return '$0.00';
  }

  const amountText = formatted.replace('$', '');
  if (!amountText.includes('.')) {
    return `$${amountText}.00`;
  }

  const [dollars, cents] = amountText.split('.');
  return `$${dollars}.${cents.padEnd(2, '0')}`;
};

// Helpers to support both legacy and new X402 record shapes
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

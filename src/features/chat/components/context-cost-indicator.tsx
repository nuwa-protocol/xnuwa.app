import type { LanguageModelUsage } from 'ai';
import { useNavigate } from 'react-router-dom';
import type { PaymentTransaction } from '@/features/wallet/types';
import { formatUsdCost } from '@/features/wallet/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface ContextCostIndicatorProps {
  contextUsage?: LanguageModelUsage;
  contextLength: number;
  paymentInfo?: {
    transactions: PaymentTransaction[];
    totalAmount: bigint;
  } | null;
}

export function ContextCostIndicator({
  contextUsage,
  contextLength,
  paymentInfo,
}: ContextCostIndicatorProps) {
  const navigate = useNavigate();

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
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-6 pt-6">
          {/* Context Usage Section */}
          {contextUsage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Context Usage</h3>
                <div className="text-sm font-medium text-muted-foreground">
                  {contextUsage.totalTokens?.toLocaleString()} / {contextLength?.toLocaleString()}
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
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input Tokens</div>
                  <div className="text-sm font-semibold">
                    {contextUsage.inputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Output Tokens</div>
                  <div className="text-sm font-semibold">
                    {contextUsage.outputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reasoning</div>
                  <div className="text-sm font-semibold">
                    {contextUsage.reasoningTokens?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cached</div>
                  <div className="text-sm font-semibold">
                    {contextUsage.cachedInputTokens?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="mt-6 border-t" />
        </div>
        {/* Total Cost Section */}
        <Button variant='ghost' className='w-full px-6 my-3' onClick={handleWalletClick}>
          <div
            className="w-full justify-between rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Total Cost</h3>
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

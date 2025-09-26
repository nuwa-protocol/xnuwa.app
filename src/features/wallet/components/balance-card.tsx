import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  CircleDollarSign,
  WalletIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils/cn';
import { WalletStore } from '../stores';
import { BuyCreditsStepperModal } from './buy-credits';
import { TestnetFaucetDialog } from './testnet-faucet-dialog';

export function BalanceCard() {
  const { usdAmount, balanceLoading, balanceError } = WalletStore();
  const [showFaucetDialog, setShowFaucetDialog] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const usdValue = balanceLoading
    ? 'loading...'
    : balanceError
      ? 'Failed to load balance'
      : usdAmount;

  const handleBuy = () => {
    setShowBuyModal(true);
  };

  return (
    <>
      <Card
        className={cn(
          'relative overflow-hidden border-0 shadow-lg bg-theme-100',
          'bg-gradient-to-br from-theme-100 via-theme-50 to-theme-100',
          'dark:bg-gradient-to-br dark:from-theme-950 dark:via-theme-800 dark:to-theme-950',
        )}
      >
        <CardHeader className="sr-only">Wallet Balance Card</CardHeader>
        <CardContent className="flex flex-col justify-between">
          <div className="flex flex-row justify-between items-center">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-theme-primary/10 border border-theme-primary/20">
                <WalletIcon className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Credit Balance
                </CardTitle>
              </div>
            </div>
            {/* Balance Display */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  ${usdValue}
                </div>
                <div className="text-lg font-medium text-muted-foreground">
                  USD
                </div>
              </div>
            </div>
          </div>
          <TooltipProvider delayDuration={0}>
            <div className="flex flex-row items-center gap-4 mt-10">
              <Button
                variant="primary"
                size="sm"
                onClick={handleBuy}
                className="w-full"
              >
                <BanknoteArrowDown className="w-3.5 h-3.5" />
                Buy
              </Button>
              {/* Wrap disabled buttons with tooltip triggers so tooltips still work */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-full cursor-not-allowed inline-block"
                    title="coming soon"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full pointer-events-none"
                      disabled={true}
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      Transfer
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  Transfer function will be available soon
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="w-full cursor-not-allowed inline-block"
                    title="coming soon"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full pointer-events-none"
                      disabled={true}
                    >
                      <BanknoteArrowUp className="w-3.5 h-3.5" />
                      Withdraw
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  Withdraw function will be available soon
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <BuyCreditsStepperModal
        open={showBuyModal}
        onOpenChange={setShowBuyModal}
      />

      <TestnetFaucetDialog
        open={showFaucetDialog}
        onOpenChange={setShowFaucetDialog}
      />
    </>
  );
}

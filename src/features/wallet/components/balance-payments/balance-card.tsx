import { Copy, WalletIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AccountStore } from '@/features/auth/store';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils/cn';
import { WalletStore } from '../../stores';
import { TestnetFaucetDialog } from '../testnet-faucet-dialog';
import { BuyCreditsModal } from './deposit';

export function BalanceCard() {
  const { usdAmount, balanceLoading, balanceError } = WalletStore();
  const [showFaucetDialog, setShowFaucetDialog] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const account = AccountStore((s) => s.account);

  const usdValue = balanceLoading || balanceError ? '-.--' : usdAmount;

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
                <CardTitle className="text-lg font-semibold">Balance</CardTitle>
                <div className='flex items-center gap-4'>
                  {account?.address ? (
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      Account:{' '}
                      {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                    </div>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(account?.address || '');
                      toast.success('Account copied to clipboard');
                    }}
                    className='w-2 h-2'
                  >
                    <Copy className="w-2 h-2" />
                  </Button>
                </div>
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
              {/* New single button linking to Base faucets docs */}
              <Button asChild variant="primary" size="sm" className="w-full">
                <a
                  href="https://docs.base.org/base-chain/tools/network-faucets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get balance from faucet
                </a>
              </Button>

              {/* Previous actions commented out per request */}
              {/**
              <Button
                variant="primary"
                size="sm"
                onClick={handleBuy}
                className="w-full"
              >
                <BanknoteArrowDown className="w-3.5 h-3.5" />
                Buy
              </Button>
              */}
              {/**
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFaucetDialog(true)}
                className="w-full"
              >
                <HandCoins className="w-3.5 h-3.5" />
                Free Credits
              </Button>
              */}
              {/* Wrap disabled buttons with tooltip triggers so tooltips still work */}
              {/**
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
              */}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <BuyCreditsModal open={showBuyModal} onOpenChange={setShowBuyModal} />

      <TestnetFaucetDialog
        open={showFaucetDialog}
        onOpenChange={setShowFaucetDialog}
      />
    </>
  );
}

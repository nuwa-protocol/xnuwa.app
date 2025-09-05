import { CircleDollarSign, WalletIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { WalletStore } from '../stores';
import { TestnetFaucetDialog } from './testnet-faucet-dialog';

interface BalanceCardProps {
  onTopUp: () => void;
}

export function BalanceCard({ onTopUp }: BalanceCardProps) {
  const { usdAmount, balanceLoading, balanceError } = WalletStore();
  const [showFaucetDialog, setShowFaucetDialog] = useState(false);

  const usdValue = balanceLoading ? 'loading...' : balanceError ? 'Failed to load balance' : usdAmount;

  return (
    <>
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 via-transparent to-theme-primary/5" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />

        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-theme-primary/10 border border-theme-primary/20">
                <WalletIcon className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Balance</CardTitle>
                <p className="text-sm text-muted-foreground">Testnet</p>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFaucetDialog(true)}
              >
                <CircleDollarSign className="w-3.5 h-3.5" />
                Get More Balance
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div>
            {/* Main balance display */}
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
        </CardContent>
      </Card>

      <TestnetFaucetDialog
        open={showFaucetDialog}
        onOpenChange={setShowFaucetDialog}
      />
    </>
  );
}

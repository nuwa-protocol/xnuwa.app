import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { useAccountData } from '../hooks/use-account-data';
import { useDevMode } from '@/shared/hooks/use-dev-mode';

interface BalanceCardProps {
  onTopUp: () => void;
  showUSD: boolean;
  onToggleUSD: (showUSD: boolean) => void;
}

export function BalanceCard({
  onTopUp,
  showUSD,
  onToggleUSD,
}: BalanceCardProps) {
  const { balance } = useAccountData();
  const isDevMode = useDevMode();

  const displayValue = showUSD
    ? `$${(balance.nuwaTokens * balance.usdRate).toFixed(2)}`
    : `${balance.nuwaTokens.toLocaleString()} $NUWA`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Credits</span>
          <div className="flex items-center space-x-2 text-sm font-normal">
            <span className={!showUSD ? 'font-medium' : ''}>$NUWA</span>
            <Switch
              checked={showUSD}
              onCheckedChange={onToggleUSD}
              aria-label="Toggle between NUWA tokens and USD display"
            />
            <span className={showUSD ? 'font-medium' : ''}>USD</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-blue-600">
              {displayValue}
            </div>
            <p className="text-sm text-muted-foreground">
              {showUSD
                ? `${balance.nuwaTokens.toLocaleString()} $NUWA`
                : `$${(balance.nuwaTokens * balance.usdRate).toFixed(2)} USD`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onTopUp} className="flex-1">
              Buy Credits
            </Button>
            {isDevMode && (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => console.log('Transfer clicked')}
                >
                  Transfer
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => console.log('Withdraw clicked')}
                >
                  Withdraw
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

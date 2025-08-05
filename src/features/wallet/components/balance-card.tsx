import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useDevMode } from '@/shared/hooks/use-dev-mode';
import { useNuwaToUsdRate } from '../hooks/use-nuwa-to-usd-rate';
import { useWallet } from '../hooks/use-wallet';

interface BalanceCardProps {
  onTopUp: () => void;
}

export function BalanceCard({ onTopUp }: BalanceCardProps) {
  const { balance } = useWallet();
  const nuwaToUsdRate = useNuwaToUsdRate();
  const isDevMode = useDevMode();

  const nuwaValue = balance.toLocaleString();
  const usdValue = (balance / nuwaToUsdRate).toFixed(6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-3xl font-bold">{`$${usdValue} USD`}</div>
            <p className="text-sm text-muted-foreground">
              {`${nuwaValue} $NUWA`}
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

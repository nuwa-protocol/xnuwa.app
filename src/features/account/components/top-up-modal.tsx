import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { accountApi } from '../services/account-api';
import { useAccountData } from '../hooks/use-account-data';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshBalance } = useAccountData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await accountApi.topUpBalance({
        amount: numAmount,
        paymentMethod: 'credit_card',
      });

      if (result.success) {
        await refreshBalance();
        setAmount('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Top-up failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const presetAmounts = [500, 1000, 2500, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy $NUWA</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              $NUWA Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="1"
              min="1"
              placeholder="Enter $NUWA amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            {amount && (
              <p className="text-sm text-muted-foreground mt-1">
                Cost: ${(parseFloat(amount) * 0.02).toFixed(2)} USD
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Quick amounts:</p>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !amount}>
              {isLoading ? 'Processing...' : 'Buy $NUWA'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

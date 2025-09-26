import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import type { Currency } from '../../../types';
import { AmountInput } from './amount-input';
import { CurrencyCombobox } from './currency-combox';
import { PreviewCard } from './preview-card';

export type OrderCreationProps = {
  onComplete: (amount: number, currency: Currency) => void;
};

export function OrderCreation(props: OrderCreationProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const { onComplete } = props;

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-muted-foreground/10 shadow-sm">
        <CardHeader className="sr-only">
          <CardTitle>Buy</CardTitle>
          <CardDescription>
            Choose your currency first, then enter the credits you want to buy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <CurrencyCombobox
            currency={currency}
            onCurrencyChange={setCurrency}
          />
          <AmountInput
            currency={currency}
            amount={amount}
            onAmountChange={setAmount}
            disabled={!currency}
          />
          {/* Preview section (only after both currency and amount set) */}
          {currency && amount && amount > 0 && (
            <PreviewCard currency={currency} amount={amount} />
          )}
        </CardContent>
      </Card>
      {
        currency && amount && amount > 0 && (
          <Button className="mt-4" onClick={() => onComplete(amount, currency)}>
            Buy Credits
          </Button>
        )
      }
    </div>
  );
}

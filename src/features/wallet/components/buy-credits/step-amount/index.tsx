import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { Currency } from '../../../types';
import { AmountInput } from './amount-input';
import { CurrencyCombobox } from './currency-combox';
import { PreviewCard } from './preview-card';

export type BuyCreditsAmountStepProps = {
  amount: number | null;
  currency: Currency | null;
  onAmountChange: (val: number | null) => void;
  onCurrencyChange: (val: Currency) => void;
  onNext: () => void;
};

export function BuyCreditsAmountStep(props: BuyCreditsAmountStepProps) {
  const { amount, currency, onAmountChange, onCurrencyChange, onNext } = props;

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
            onCurrencyChange={onCurrencyChange}
          />
          <AmountInput
            currency={currency}
            amount={amount}
            onAmountChange={onAmountChange}
            disabled={!currency}
          />
          {/* Preview section (only after both currency and amount set) */}
          {currency && amount && amount > 0 && (
            <PreviewCard currency={currency} amount={amount} />
          )}
        </CardContent>
      </Card>
      <Button className='mt-4' onClick={() => onNext()}>Buy Credits</Button>
    </div>
  );
}

import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { Currency } from '../../types';
import { BuyCreditsAmountStep } from './step-amount';
import { BuyCreditsPaymentStep } from './step-payment';

type Step = 'form' | 'payment' | 'result';

export type BuyCreditsStepperModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BuyCreditsStepperModal({
  open,
  onOpenChange,
}: BuyCreditsStepperModalProps) {
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);


  useEffect(() => {
    if (!open) {
      setStep('form');
      setAmount(null);
      setCurrency(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" /> Buy Nuwa Credits
          </DialogTitle>
        </DialogHeader>
        <Stepper step={step} setStep={setStep} open={open} currency={currency} amount={amount} setAmount={setAmount} setCurrency={setCurrency} />
      </DialogContent>
    </Dialog>
  );
}

export const Stepper = ({
  step,
  setStep,
  open,
  currency,
  amount,
  setAmount,
  setCurrency,
}: {
  step: Step;
  setStep: (step: Step) => void;
  open: boolean;
  currency: Currency | null;
  amount: number | null;
  setAmount: (amount: number | null) => void;
  setCurrency: (currency: Currency | null) => void;
}) => {


  switch (step) {
    case 'form':
      return (
        <BuyCreditsAmountStep
          currency={currency}
          amount={amount}
          onAmountChange={setAmount}
          onCurrencyChange={setCurrency}
          onNext={() => {
            if (currency && amount && amount > 0) {
              setStep('payment');
            }
          }}
        />
      );
    case 'payment':
      if (currency && amount) {
        return <BuyCreditsPaymentStep amount={amount} currency={currency} />;
      }
      return null;
  }
};

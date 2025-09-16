import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useDevMode } from '@/shared/hooks/use-dev-mode';
import { useHandlePayment } from '../hooks/use-handle-payment';
import type { Asset, Network } from '../types';
import { AssetSelector } from './asset-selector';
import { NetworkSelector } from './network-selector';

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !Number.isNaN(Number(val)),
      'Amount must be a valid number',
    )
    .refine((val) => Number(val) > 0, 'Amount must be greater than 0')
    .refine(
      (val) => Number(val) <= 1000000,
      'Amount must be less than $1,000,000',
    ),
  // .refine((val) => Number(val) >= 0.01, 'Minimum amount is $0.01'),
});

type FormData = z.infer<typeof formSchema>;

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>('usdt');
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('ethereum');
  const [selectedAmountOption, setSelectedAmountOption] = useState<
    number | 'other' | null
  >(null);
  const isDevMode = useDevMode();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      amount: '',
    },
  });

  const { handleCryptoPayment } = useHandlePayment();

  // Reset form and selections when modal opens
  useEffect(() => {
    if (open) {
      setSelectedAsset('usdt');
      setSelectedNetwork('ethereum');
      setSelectedAmountOption(null);
      form.reset({
        amount: '',
      });
    }
  }, [open, form]);

  const onSubmit = async (data: FormData) => {
    const numAmount = Number(data.amount);
    onOpenChange(false);
    await handleCryptoPayment(selectedAsset, selectedNetwork, numAmount);
  };

  const handlePresetAmount = (preset: number) => {
    setSelectedAmountOption(preset);
    form.setValue('amount', preset.toString(), { shouldValidate: true });
  };

  const handleOtherAmount = () => {
    setSelectedAmountOption('other');
    form.setValue('amount', '', { shouldValidate: false });
  };

  const presetAmounts = isDevMode
    ? [0.00001, 1, 5, 10, 20, 50]
    : [1, 5, 10, 20, 50];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy $NUWA</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AssetSelector
              value={selectedAsset}
              onValueChange={setSelectedAsset}
            />

            <NetworkSelector
              value={selectedNetwork}
              onValueChange={setSelectedNetwork}
            />

            <div>
              <p className="text-sm font-medium mb-2">Amount options:</p>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={
                      selectedAmountOption === preset ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handlePresetAmount(preset)}
                  >
                    ${preset}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={
                    selectedAmountOption === 'other' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={handleOtherAmount}
                >
                  Other
                </Button>
              </div>
            </div>

            {selectedAmountOption === 'other' && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter custom amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  !selectedAmountOption ||
                  (selectedAmountOption === 'other' && !form.watch('amount'))
                }
              >
                {form.formState.isSubmitting ? 'Processing...' : 'Buy'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

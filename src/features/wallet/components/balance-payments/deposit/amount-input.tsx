import { DollarSign, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getMinAmount } from '@/features/wallet/services/deposit';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils';
import type { Currency } from '../../../types';
import { QuickAmounts } from '../../../utils';

// TODO: compare the amount with the min amount and reject order creation

export function AmountInput({
    currency,
    onAmountChange,
    disabled,
}: {
    currency: Currency | null;
    onAmountChange: (val: number | null) => void;
    disabled: boolean;
}) {
    const amountFieldId = useId();
    const [isQuickOpen, setIsQuickOpen] = useState(false);
    const [minAmount, setMinAmount] = useState<number | null>(null);
    const [isFetchingMin, setIsFetchingMin] = useState(false);
    const [belowMin, setBelowMin] = useState<boolean>(false);
    const [amountInput, setAmountInput] = useState<number | null>(null);


    // Debounced fetch for min amount in USD (choose currency first)
    const fetchMin = async (payCurrency: Currency) => {
        if (!payCurrency) return;
        setIsFetchingMin(true);
        try {
            // Query the minimum FROM=USD to payCurrency so the result is in USD (credits)
            const res = await getMinAmount(payCurrency.code);
            setMinAmount(typeof res === 'number' ? res : 0);
        } catch (e) {
            setMinAmount(0);
        } finally {
            setIsFetchingMin(false);
        }
    };

    // Helpers for UI text
    const selectedUnit = useMemo(
        () => currency?.code?.toUpperCase() ?? '',
        [currency],
    );

    // When currency changes, fetch min and the USD-per-token rate
    useEffect(() => {
        if (!currency) {
            setMinAmount(null);
            return;
        }
        fetchMin(currency);
    }, [currency]);

    const handlePopoverOpenChange = useCallback((open: boolean) => {
        if (minAmount && open) setIsQuickOpen(true);
        if (!open) setIsQuickOpen(false);
    }, [minAmount]);

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmountInput(Number(val));
        if (minAmount && val && Number(val) < minAmount) {
            setBelowMin(true);
            onAmountChange(null);
            return;
        }
        setBelowMin(false);
        onAmountChange(Number(val));
    }, [minAmount, onAmountChange]);

    return (
        <div className="space-y-2">
            <div className="relative">
                <Label htmlFor={amountFieldId}>Amount</Label>
                {/* Quick picks */}
                <Popover open={isQuickOpen} onOpenChange={handlePopoverOpenChange}>
                    <PopoverTrigger asChild>
                        <div className="flex flex-row items-center gap-2">
                            <DollarSign className="absolute left-2 text-muted-foreground size-4" />
                            <Input
                                id={amountFieldId}
                                type="number"
                                inputMode="decimal"
                                min={0}
                                placeholder="Enter amount"
                                className="pl-10 pr-28"
                                value={amountInput || undefined}
                                onChange={handleAmountChange}
                                disabled={disabled}
                            />
                            <span className="absolute right-2 text-muted-foreground text-xs">
                                USD
                            </span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-2">
                        <div className="grid grid-cols-3 gap-2">
                            {QuickAmounts(minAmount).map((v) => (
                                <Button
                                    key={v}
                                    type="button"
                                    variant="outline"
                                    className="justify-center"
                                    onClick={() => {
                                        onAmountChange(v);
                                        setIsQuickOpen(false);
                                    }}
                                >
                                    {`$${v}`}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            {minAmount !== null && (
                <div className="text-xs text-muted-foreground">
                    {isFetchingMin ? (
                        <span className="inline-flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Checking minimum amount...
                        </span>
                    ) : (
                        <span className={cn(belowMin && 'text-destructive')}>
                            Minimum Amount: {Math.ceil(minAmount ?? 0)} USD
                            {selectedUnit ? ` (for ${selectedUnit})` : ''}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
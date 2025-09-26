import { ChevronsUpDown as ChevronsUpDownIcon, RefreshCw } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { usePaymentCurrencies } from '@/features/wallet/hooks/use-deposit-currencies';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/shared/components/ui/command';
import { Label } from '@/shared/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils';
import { networkMap } from '../../../constants';
import type { Currency } from '../../../types';
import { CurrencyInfo } from './currency-info';

export function CurrencyCombobox({
    currency,
    onCurrencyChange,
}: {
    currency: Currency | null;
    onCurrencyChange: (val: Currency) => void;
}) {
    const currencyFieldId = useId();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const {
        currencies: cryptos,
        isLoading,
        error,
        fetchCurrencies,
    } = usePaymentCurrencies();

    // Build labels for currency options
    const currencyInfoPlaceholder = useMemo(() => {
        if (isLoading) return 'Loading...';
        if (error) return 'Failed to load';
        if (cryptos.length === 0) return 'No currencies available';
        return 'Select Payment Currency';
    }, [isLoading, error, cryptos]);

    return (
        <div className="space-y-2 ">
            <Label htmlFor={currencyFieldId}>Currency</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={false}>
                <PopoverTrigger asChild>
                    {/* Prefix: USD + $ */}
                    <Button
                        id={currencyFieldId}
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpen}
                        disabled={isLoading || !!error || cryptos.length === 0}
                        className={cn(
                            'w-full justify-between',
                            !currency && 'text-muted-foreground',
                        )}
                    >
                        <CurrencyInfo
                            currency={currency}
                            placeholder={currencyInfoPlaceholder}
                        />
                        <div className="flex flex-row items-center gap-2">
                            {currency?.network && (
                                <Badge variant="outline">
                                    {networkMap[currency.network as keyof typeof networkMap]}
                                </Badge>
                            )}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </Button>
                </PopoverTrigger>
                {/* Use p-0 to let the internal CommandList own the scroll area. */}
                <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                    side="bottom"
                >
                    <Command>
                        <CommandInput placeholder="Search currency..." />
                        <CommandList
                            className="max-h-80"
                            style={{ maxHeight: 'min(20rem, calc(100vh - 8rem))' }}
                            onWheelCapture={(e) => e.stopPropagation()}
                            onTouchMoveCapture={(e) => e.stopPropagation()}
                        >
                            <CommandEmpty>No currency found.</CommandEmpty>
                            <CommandGroup>
                                {/* TODO: Limit to 20 for debug */}
                                {cryptos.slice(0, 20).map((t) => (
                                    <CommandItem
                                        key={t.code}
                                        value={t.code}
                                        onSelect={(val) => {
                                            onCurrencyChange(cryptos.find((c) => c.code === val)!);
                                            setPopoverOpen(false);
                                        }}
                                        className="flex flex-row items-center justify-between"
                                    >
                                        <CurrencyInfo currency={t} />
                                        {t.network && (
                                            <Badge variant="outline">
                                                {networkMap[t.network as keyof typeof networkMap]}
                                            </Badge>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <div className="flex items-center gap-2 text-xs text-destructive">
                    {error}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={fetchCurrencies}
                    >
                        <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry
                    </Button>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { getExchangeRate } from '@/features/wallet/services';
import { formatSmallNumber } from '@/features/wallet/utils';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { Currency } from '../../../types';

export function PreviewCard({
    currency,
    amount,
}: {
    currency: Currency;
    amount: number;
}) {
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        getExchangeRate(currency.code)
            .then(setExchangeRate)
            .catch(setError)
            .finally(() => setIsLoading(false));
    }, [currency, amount]);

    const getEstimatedAmount = (amount: number) => {
        if (!exchangeRate) return null;
        const estimatedAmount = amount * exchangeRate;
        if (estimatedAmount < 1) return formatSmallNumber(estimatedAmount);
        return estimatedAmount.toFixed(2);
    };

    const getExchangeRateText = () => {
        if (!exchangeRate) return null;
        if (exchangeRate < 1)
            return `1 ${currency.code.toUpperCase()} ≈ $${(1 / exchangeRate).toFixed(2)} USD`;
        return `1 USD ≈ ${exchangeRate.toFixed(2)} ${currency.code.toUpperCase()}`;
    };

    const estimatedAmount = getEstimatedAmount(amount);
    const exchangeRateText = getExchangeRateText();

    if (!exchangeRate || error) return null;

    if (isLoading) return (
        <div className='flex flex-col gap-2 bg-muted/20'>
            <Skeleton className="w-[470px] h-[40px]" />
            <Skeleton className="w-[470px] h-[80px]" />
        </div>
    );

    return (
        <Card className="relative overflow-hidden border-0 bg-accent">
            <CardHeader className="sr-only">
                <CardTitle>Payment Preview</CardTitle>
                <CardDescription>
                    The amount of selected currency you will pay with.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
                {/* Primary Amount Display */}
                <div className="flex flex-row justify-between items-center gap-2 border-b">
                    <p className="text-md">Estimated Total</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{estimatedAmount}</span>
                        <span className="text-lg font-semibold text-muted-foreground">
                            {currency.code.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Exchange Rate */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">Exchange Rate</span>
                    <span className="text-sm font-medium text-muted-foreground">
                        {exchangeRateText}
                    </span>
                </div>

                {/* Disclaimer */}
                <div className="flex items-start gap-2 p-0 mt-4 rounded-lg bg-muted/30">
                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Amounts are estimates. Final totals (incl. fees) will be confirmed
                        in the next step.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

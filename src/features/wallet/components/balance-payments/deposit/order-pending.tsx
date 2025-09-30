import {
    BadgeDollarSign,
    Clock,
    Copy,
    Loader,
    Network,
    RefreshCw,
    Wallet,
} from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTimeLeft } from '@/features/wallet/hooks/use-timeleft';
import type { DepositOrder } from '@/features/wallet/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { networkMap } from '../../../constants';
import { StatusBadge } from '../../status-badge';

interface OrderPendingProps {
    order: DepositOrder;
    isOrderUpdating: boolean;
    updateOrder: () => void;
}

export function OrderPending({
    order,
    isOrderUpdating,
    updateOrder,
}: OrderPendingProps) {
    const { timeLeft, updateExpirationTime } = useTimeLeft(order.expirationTime);

    useEffect(() => {
        updateExpirationTime(order.expirationTime);
    }, [order.expirationTime]);

    const [copy] = useCopyToClipboard();
    const handleCopy = (text: string) => {
        copy(text);
        toast.success('Copied to clipboard');
    };

    const formatTimeLeft = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-medium">
                        <BadgeDollarSign className="h-5 w-5" />
                        Complete Payment
                    </h3>
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatTimeLeft(timeLeft)}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    Transfer the requested amount to the address below. Your balance will
                    update automatically after confirmation.
                </p>
            </div>

            {/* Primary Payment Address Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        <div className="text-sm text-muted-foreground">
                            Send{' '}
                            <span className="text-lg font-semibold text-foreground">
                                {order.totalDue || '0'}{' '}
                            </span>{' '}
                            <span className="text-sm font-semibold text-foreground">
                                {order.paymentCurrency?.toUpperCase() || 'N/A'}{' '}
                            </span>
                            to this address:
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Payment Address - Primary Focus */}
                    <div className="space-y-3">
                        {/* Address Display - Hero Element */}
                        <Button
                            className="relative cursor-pointer hover:bg-accent w-full py-8"
                            variant="ghost"
                            asChild
                            onClick={() => handleCopy(order.paymentAddress)}
                        >
                            <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed border-primary/30 w-full">
                                <div className="font-mono text-sm break-all text-center leading-relaxed font-medium whitespace-pre-wrap py-2">
                                    {order.paymentAddress || 'Address not available'}
                                </div>
                            </div>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {/* Ensure long order ids never overflow the card by using a two-column grid.
                       The value column gets min-w-0 and truncate so it ellipsizes gracefully. */}
                    <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                        <span className="text-muted-foreground">Order ID</span>
                        <div className="min-w-0 flex items-center justify-end gap-1">
                            <span
                                className="font-mono text-xs truncate"
                                title={order.orderId || 'N/A'}
                            >
                                {`${order.orderId.slice(0, 10)}...${order.orderId.slice(-10)}` || 'N/A'}
                            </span>
                            {order.orderId ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => handleCopy(order.orderId!)}
                                    aria-label="Copy Order ID"
                                    title="Copy"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Purchase</span>
                        <span className="font-medium">
                            ${order.purchasedAmount || '0'} USD
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Pay</span>
                        <span className="font-medium">
                            {order.totalDue || '0'}{' '}
                            {order.paymentCurrency?.toUpperCase() || 'N/A'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Network</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Network className="h-3 w-3" />
                            {order.paymentNetwork
                                ? networkMap[order.paymentNetwork as keyof typeof networkMap]
                                : 'Unknown'}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Received</span>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">
                                {order.received || 0}{' '}
                                {order.paymentCurrency?.toUpperCase() || 'N/A'}
                            </span>
                            {order.status !== 'completed' && (
                                <Loader className="h-4 w-4 animate-spin" />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        {order.status ? (
                            <StatusBadge status={order.status} />
                        ) : (
                            <Badge variant="outline">Unknown</Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Timer and Actions */}
            <div className="space-y-4">
                <div className="flex w-full">
                    <Button
                        onClick={updateOrder}
                        disabled={isOrderUpdating}
                        className="w-full"
                    >
                        {isOrderUpdating ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Refresh Status
                    </Button>
                </div>
            </div>
        </div>
    );
}

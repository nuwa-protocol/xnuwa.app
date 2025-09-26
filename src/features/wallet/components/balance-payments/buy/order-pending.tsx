import {
    BadgeDollarSign,
    Clock,
    Loader,
    Network,
    RefreshCw,
    Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { useTimeLeft } from '../../../hooks/use-timeleft';
import { StatusBadge } from '../../status-badge';

interface OrderPendingProps {
    order: DepositOrder;
    isOrderUpdating: boolean;
    updateOrder: () => void;
}

export function OrderPending({ order, isOrderUpdating, updateOrder }: OrderPendingProps) {
    const { timeLeft } = useTimeLeft(order?.expirationTime || '');

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
        <div className="space-y-6">
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
                            className="relative cursor-pointer hover:bg-accent w-full"
                            variant="ghost"
                            asChild
                            onClick={() => handleCopy(order.paymentAddress)}
                        >
                            <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed border-primary/30">
                                <div className="font-mono text-sm break-all text-center leading-relaxed font-medium">
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
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Order ID</span>
                        <span className="font-mono text-xs">
                            {order.orderId || 'N/A'}
                        </span>
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
                            {
                                order.status !== 'completed' && (
                                    <Loader className="h-4 w-4 animate-spin" />
                                )
                            }
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

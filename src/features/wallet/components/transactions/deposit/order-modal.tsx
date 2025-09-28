import { RefreshCw, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useDepositOrderById } from '@/features/wallet/hooks/use-deposit-order-byid';
import type { DepositOrder } from '@/features/wallet/types/deposit';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { OrderCompleted } from '../../balance-payments/deposit/order-completed';
import { OrderExpired } from '../../balance-payments/deposit/order-expired';
import { OrderPending } from '../../balance-payments/deposit/order-pending';

export function DepositOrderModalContent({
    updateError,
    isUpdating,
    order,
    updateOrder,
    onReCreate,
}: {
    updateError: string | null;
    isUpdating: boolean;
    order: DepositOrder | null;
    updateOrder: () => void;
    onReCreate?: () => void;
}) {
    if (updateError) {
        return (
            <DepositOrderModalError onRetry={updateOrder} isUpdating={isUpdating} />
        );
    }
    if (isUpdating && !order) {
        return <DepositOrderModalLoading />;
    }
    if (order?.status === 'completed') {
        return <OrderCompleted order={order} />;
    }
    if (order?.status === 'expired') {
        return <OrderExpired order={order} onRetry={onReCreate} />;
    }
    if (order?.status === 'pending' || order?.status === 'partially_paid') {
        return (
            <OrderPending
                order={order}
                isOrderUpdating={isUpdating}
                updateOrder={updateOrder}
            />
        );
    }
}

export function DepositOrderModalLoading() {
    return (
        <div className="space-y-6 w-full flex flex-col items-center justify-center">
            <Card className="w-full">
                <CardContent className="flex pt-6 w-full">
                    <div className="flex flex-col space-y-4 w-full">
                        <div className="space-y-2 flex flex-col w-full items-center justify-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function DepositOrderModalError({
    onRetry,
    isUpdating,
}: {
    onRetry: () => void;
    isUpdating: boolean;
}) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                    <XCircle className="h-5 w-5 text-destructive" /> Failed to Load Order
                </h3>
                <p className="text-sm text-muted-foreground">
                    We encountered an error while loading your deposit order details.
                </p>
            </div>
            <div className="flex justify-center">
                <Button onClick={onRetry} variant="outline" disabled={isUpdating}>
                    {isUpdating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Retry Payment Creation
                </Button>
            </div>
        </div>
    );
}


export function DepositOrderModal({
    selectedOrderPaymentId,
    open,
    onOpenChange,
    onReCreate,
}: {
    selectedOrderPaymentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReCreate?: () => void;
}) {
    const { order, isUpdating, updateError, updateOrder } = useDepositOrderById(
        selectedOrderPaymentId,
    );

    useEffect(() => {
        if (open && selectedOrderPaymentId) {
            updateOrder();
        }
    }, [open, selectedOrderPaymentId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Deposit Order</DialogTitle>
                </DialogHeader>
                <DepositOrderModalContent
                    updateError={updateError}
                    isUpdating={isUpdating}
                    order={order}
                    updateOrder={updateOrder}
                    onReCreate={onReCreate}
                />
            </DialogContent>
        </Dialog>
    );
}

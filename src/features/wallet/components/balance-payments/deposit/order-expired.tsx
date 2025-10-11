import { Clock, RefreshCw, XCircle } from 'lucide-react';
import type { DepositOrder } from '@/features/wallet/types/deposit';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export type OrderExpiredProps = {
  order: DepositOrder;
  onRetry?: () => void;
};

export function OrderExpired({
  order,
  onRetry,
}: OrderExpiredProps) {
  return (
    <div className="space-y-6">
      {/* Expired Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Payment Expired
          </h3>
          <p className="text-sm text-muted-foreground">
            The payment window for this order has expired.
          </p>
        </div>
      </div>

      {/* Expired Payment Details */}
      <Card className="border-2 bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Clock className="h-5 w-5" />
            Expired Order Details
          </CardTitle>
          <CardDescription>
            This payment order is no longer active and cannot accept payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order Amount</span>
              <span className="font-mono text-xs break-all text-right w-1/2">
                ${order.purchasedAmount || '0'} USD
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs break-all text-right w-1/2">
                {`${order.orderId.slice(0, 10)}...${order.orderId.slice(-10)}` || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Expired At</span>
              <span className="text-xs">
                {order.expirationTime
                  ? new Date(order.expirationTime).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onRetry && (
          <Button onClick={onRetry} className="w-full" size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Same Payment
          </Button>
        )}
      </div>
    </div>
  );
}

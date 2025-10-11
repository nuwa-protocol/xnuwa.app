import { CheckCircle, CreditCard } from 'lucide-react';
import type { DepositOrder } from '@/features/wallet/types/deposit';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export type OrderCompletedProps = {
  order: DepositOrder;
};

export function OrderCompleted({ order }: OrderCompletedProps) {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Payment Completed!
          </h3>
          <p className="text-sm text-muted-foreground">
            Your credits have been successfully added to your wallet.
          </p>
        </div>
      </div>

      {/* Payment Summary Card */}
      <Card className="border-2 bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CreditCard className="h-5 w-5" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Credits Added</span>
              <span className="font-mono text-xs break-all text-right w-1/2">
                ${order.transferredAmount || '0'} USD
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs break-all text-right w-1/2">
                {`${order.orderId.slice(0, 10)}...${order.orderId.slice(-10)}` || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order Time</span>
              <span className="font-mono text-xs break-all text-right w-1/2">
                {order.updatedAt
                  ? new Date(order.updatedAt).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

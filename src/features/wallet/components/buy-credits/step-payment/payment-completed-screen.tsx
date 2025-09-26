import { CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { PaymentOrder } from '../../../types/deposit-transactions';

export type PaymentCompletedScreenProps = {
  payment: PaymentOrder;
  onViewWallet?: () => void;
};

export function PaymentCompletedScreen({
  payment,
  onViewWallet,
}: PaymentCompletedScreenProps) {
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
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 via-background to-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CreditCard className="h-5 w-5" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Credits Added</span>
              <div className="font-semibold text-lg">
                ${payment.purchasedAmount || '0'} USD
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Amount Paid</span>
              <div className="font-semibold">
                {payment.received || payment.totalDue || '0'}{' '}
                {payment.paymentCurrency?.toUpperCase() || 'N/A'}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs">
                {payment.orderId || 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button onClick={onViewWallet} className="w-full" size="lg">
          <ExternalLink className="mr-2 h-4 w-4" />
          View Wallet Balance
        </Button>
      </div>
    </div>
  );
}
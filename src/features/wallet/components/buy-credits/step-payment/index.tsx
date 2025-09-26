import {
  BadgeDollarSign,
  Clock,
  Loader2,
  Network,
  RefreshCw,
  Wallet,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { networkMap } from '../../../constants';
import { useDepositPayment } from '../../../hooks/use-deposit-payment';
import type { Currency } from '../../../types/deposit-transactions';
import { PaymentCompletedScreen } from './payment-completed-screen';
import { PaymentExpiredScreen } from './payment-expired-screen';
import { StatusBadge } from './status-badge';

export type BuyCreditsPaymentStepProps = {
  amount: number;
  currency: Currency;
  onViewWallet?: () => void;
};

// Step 2: Create payment order and show payment details
export function BuyCreditsPaymentStep({
  amount,
  currency,
  onViewWallet,
}: BuyCreditsPaymentStepProps) {
  const {
    payment,
    isCreating,
    isCheckingStatus,
    timeLeft,
    error,
    retryCreate,
    checkStatus,
  } = useDepositPayment(amount, currency);

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const [copy] = useCopyToClipboard();
  const handleCopy = (text: string) => {
    copy(text);
    toast.success('Copied to clipboard');
  };

  // const isCompleted = payment?.status === 'completed';
  // const isExpired = payment?.status === 'expired' || timeLeft === 0;

  const isCompleted = true;
  const isExpired = true;

  // Show completed screen for successful payments
  if (isCompleted && payment) {
    return (
      <PaymentCompletedScreen
        payment={payment}
        onViewWallet={onViewWallet}
      />
    );
  }

  // Show expired screen for expired payments
  if (isExpired && payment) {
    return (
      <PaymentExpiredScreen
        payment={payment}
        onRetryPayment={() => retryCreate()}
      />
    );
  }

  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Creating Payment Order
          </CardTitle>
          <CardDescription>
            Please wait while we prepare your payment details...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <XCircle className="h-5 w-5 text-destructive" /> Payment Creation
            Failed
          </h3>
          <p className="text-sm text-muted-foreground">
            We encountered an error while creating your payment order.
          </p>
        </div>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={retryCreate} variant="outline" disabled={isCreating}>
            {isCreating ? (
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

  if (!payment) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <BadgeDollarSign className="h-5 w-5" />
            Complete Payment
          </h3>
          <div>
            {timeLeft > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTimeLeft(timeLeft)}
              </div>
            )}

            {timeLeft === 0 && (
              <div>
                <XCircle className="h-4 w-4" />
                Expired
              </div>
            )}
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
                {payment.totalDue || '0'}{' '}
              </span>{' '}
              <span className="text-sm font-semibold text-foreground">
                {payment.paymentCurrency?.toUpperCase() || 'N/A'}{' '}
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
              onClick={() => handleCopy(payment.paymentAddress)}
            >
              <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed border-primary/30">
                <div className="font-mono text-sm break-all text-center leading-relaxed font-medium">
                  {payment.paymentAddress || 'Address not available'}
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
              {payment.orderId || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Purchase</span>
            <span className="font-medium">
              ${payment.purchasedAmount || '0'} USD
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Pay</span>
            <span className="font-medium">
              {payment.totalDue || '0'}{' '}
              {payment.paymentCurrency?.toUpperCase() || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Network</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              {payment.network
                ? networkMap[payment.network as keyof typeof networkMap]
                : 'Unknown'}
            </Badge>
          </div>

          {payment.received && payment.received > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Received</span>
              <span className="font-medium text-green-600">
                {payment.received}{' '}
                {payment.paymentCurrency?.toUpperCase() || 'N/A'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            {payment.status ? (
              <StatusBadge status={payment.status} />
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
            onClick={checkStatus}
            disabled={isCheckingStatus}
            className="w-full"
          >
            {isCheckingStatus ? (
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

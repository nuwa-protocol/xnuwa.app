import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Loader2,
  Network,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { useNowPayments } from '../hooks/use-nowpayments';

interface PaymentWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: {
    payment_id: string;
    payment_status: string;
    pay_address: string;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    amount_received: number;
    pay_currency: string;
    order_id: string;
    order_description: string;
    network: string;
    expiration_estimate_date: string;
    valid_until: string;
  } | null;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  paymentData,
  onPaymentSuccess,
}: PaymentWindowProps) {
  const [currentPaymentData, setCurrentPaymentData] = useState(paymentData);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(1800); // 30分钟

  const { checkPaymentStatus } = useNowPayments();
  const [copyToClipboard, isCopied] = useCopyToClipboard();

  // 更新当前支付数据
  useEffect(() => {
    setCurrentPaymentData(paymentData);
  }, [paymentData]);

  // 倒计时
  useEffect(() => {
    if (!open || !currentPaymentData) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, currentPaymentData]);

  // 定期检查支付状态
  useEffect(() => {
    if (!open || !currentPaymentData) return;

    const checkStatus = async () => {
      // 如果支付已完成、失败、退款或过期，停止检查
      if (
        ['finished', 'confirmed', 'failed', 'refunded', 'expired'].includes(
          currentPaymentData.payment_status,
        )
      ) {
        return;
      }

      setIsCheckingStatus(true);
      setStatusError(null);

      try {
        const updatedPaymentData = await checkPaymentStatus(
          currentPaymentData.payment_id,
        );
        if (updatedPaymentData) {
          setCurrentPaymentData(updatedPaymentData);

          // 如果支付成功，触发成功回调（但不自动关闭窗口）
          if (
            updatedPaymentData.payment_status === 'finished' ||
            updatedPaymentData.payment_status === 'confirmed'
          ) {
            // 不再自动调用 onPaymentSuccess，让用户手动关闭
            // onPaymentSuccess?.();
          }
        }
      } catch (err) {
        setStatusError('检查支付状态失败');
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // 立即检查一次
    checkStatus();

    // 每秒检查一次
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [
    open,
    currentPaymentData?.payment_id,
    checkPaymentStatus,
    onPaymentSuccess,
  ]);

  // 手动刷新状态
  const handleRefreshStatus = useCallback(async () => {
    if (!currentPaymentData) return;

    setIsCheckingStatus(true);
    setStatusError(null);

    try {
      const updatedPaymentData = await checkPaymentStatus(
        currentPaymentData.payment_id,
      );
      if (updatedPaymentData) {
        setCurrentPaymentData(updatedPaymentData);

        // 如果支付成功，触发成功回调（但不自动关闭窗口）
        if (
          updatedPaymentData.payment_status === 'finished' ||
          updatedPaymentData.payment_status === 'confirmed'
        ) {
          // 不再自动调用 onPaymentSuccess，让用户手动关闭
          // onPaymentSuccess?.();
        }
      }
    } catch (err) {
      setStatusError('检查支付状态失败');
    } finally {
      setIsCheckingStatus(false);
    }
  }, [currentPaymentData, checkPaymentStatus, onPaymentSuccess]);

  const handleCopyAddress = useCallback(() => {
    if (currentPaymentData?.pay_address) {
      copyToClipboard(currentPaymentData.pay_address);
    }
  }, [currentPaymentData, copyToClipboard]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusInfo = () => {
    const status = currentPaymentData?.payment_status || 'waiting';

    switch (status) {
      case 'finished':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: '支付完成',
          description: '支付已成功完成，资金已到账',
          color: 'green' as const,
          showAddress: false,
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: '支付确认',
          description: '支付已确认，正在处理中',
          color: 'green' as const,
          showAddress: false,
        };
      case 'confirming':
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
          title: '确认中',
          description: '支付正在确认中，请稍候',
          color: 'blue' as const,
          showAddress: false,
        };
      case 'sending':
        return {
          icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
          title: '发送中',
          description: '支付正在发送中，请稍候',
          color: 'blue' as const,
          showAddress: false,
        };
      case 'partially_paid':
        return {
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
          title: '部分支付',
          description: '已收到部分支付，请完成剩余金额',
          color: 'orange' as const,
          showAddress: true,
        };
      case 'waiting':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: '等待支付',
          description: '请向以下地址转账',
          color: 'yellow' as const,
          showAddress: true,
        };
      case 'failed':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: '支付失败',
          description: '支付处理失败，请重试或联系客服',
          color: 'red' as const,
          showAddress: false,
        };
      case 'refunded':
        return {
          icon: <RefreshCw className="h-5 w-5 text-blue-500" />,
          title: '已退款',
          description: '支付已退款，资金将原路返回',
          color: 'blue' as const,
          showAddress: false,
        };
      case 'expired':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: '支付过期',
          description: '支付已过期，请重新创建支付订单',
          color: 'red' as const,
          showAddress: false,
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: '等待支付',
          description: '请向以下地址转账',
          color: 'yellow' as const,
          showAddress: true,
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!currentPaymentData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {statusInfo.icon}
            {statusInfo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 支付信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">支付详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">订单ID:</span>
                <span className="text-sm font-mono">
                  {currentPaymentData.order_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">支付金额:</span>
                <span className="text-sm font-medium">
                  {currentPaymentData.price_amount}{' '}
                  {currentPaymentData.price_currency?.toUpperCase() || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">支付货币:</span>
                <Badge variant="outline">
                  {currentPaymentData.pay_currency?.toUpperCase() || ''}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">转账金额:</span>
                <span className="text-sm font-medium">
                  {currentPaymentData.pay_amount}{' '}
                  {currentPaymentData.pay_currency?.toUpperCase() || ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">网络:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Network className="h-3 w-3" />
                  {currentPaymentData.network?.toUpperCase() || ''}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">状态:</span>
                <Badge
                  variant={
                    statusInfo.color === 'green' ? 'default' : 'secondary'
                  }
                >
                  {statusInfo.title}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 收款地址卡片 */}
          {statusInfo.showAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  收款地址
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    请向以下地址转账:
                  </div>
                  <div className="p-3 bg-muted rounded-lg border">
                    <div className="font-mono text-sm break-all">
                      {currentPaymentData.pay_address}
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyAddress}
                    className="w-full"
                    variant="outline"
                    disabled={isCopied}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {isCopied ? '已复制地址' : '复制收款地址'}
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    请确保转账金额为{' '}
                    <strong>
                      {currentPaymentData.pay_amount}{' '}
                      {currentPaymentData.pay_currency?.toUpperCase() || ''}
                    </strong>
                    <br />
                    网络:{' '}
                    <strong>
                      {currentPaymentData.network?.toUpperCase() || ''}
                    </strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* 倒计时 */}
          {statusInfo.showAddress && timeRemaining > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                请在 {formatTime(timeRemaining)} 内完成支付
              </AlertDescription>
            </Alert>
          )}

          {/* 支付超时 */}
          {statusInfo.showAddress && timeRemaining === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                支付已超时，请重新创建支付订单
              </AlertDescription>
            </Alert>
          )}

          {/* 状态检查错误 */}
          {statusError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          {/* 支付操作 */}
          {statusInfo.showAddress && (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  完成转账后，系统将自动检测到账
                </p>
                <Button
                  onClick={handleRefreshStatus}
                  variant="outline"
                  className="w-full"
                  disabled={isCheckingStatus}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`}
                  />
                  {isCheckingStatus ? '检查中...' : '手动刷新状态'}
                </Button>
              </div>
            </div>
          )}

          {/* 支付成功 */}
          {['finished', 'confirmed'].includes(
            currentPaymentData.payment_status,
          ) && (
            <div className="text-center space-y-3">
              <div className="text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">支付成功！</p>
                <p className="text-sm text-muted-foreground">
                  您的账户余额已更新
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                关闭窗口
              </Button>
            </div>
          )}

          {/* 支付失败 */}
          {currentPaymentData.payment_status === 'failed' && (
            <div className="text-center space-y-3">
              <div className="text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">支付失败</p>
                <p className="text-sm text-muted-foreground">
                  支付处理失败，请重试或联系客服
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                关闭
              </Button>
            </div>
          )}

          {/* 支付过期 */}
          {currentPaymentData.payment_status === 'expired' && (
            <div className="text-center space-y-3">
              <div className="text-red-600">
                <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">支付过期</p>
                <p className="text-sm text-muted-foreground">
                  支付已过期，请重新创建支付订单
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                关闭
              </Button>
            </div>
          )}

          {/* 已退款 */}
          {currentPaymentData.payment_status === 'refunded' && (
            <div className="text-center space-y-3">
              <div className="text-blue-600">
                <RefreshCw className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">已退款</p>
                <p className="text-sm text-muted-foreground">
                  支付已退款，资金将原路返回
                </p>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                关闭
              </Button>
            </div>
          )}

          {/* 状态检查指示器 */}
          {isCheckingStatus && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在检查支付状态...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

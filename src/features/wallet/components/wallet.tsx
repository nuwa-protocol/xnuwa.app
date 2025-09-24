import { useState } from 'react';
import { BalanceCard } from './balance-card';
import { TransactionHistory } from './transaction-history';
import { NowPaymentsTopupModal } from './nowpayments-topup-modal';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Coins, CreditCard } from 'lucide-react';

export function Wallet() {
  const [showNowPaymentsModal, setShowNowPaymentsModal] = useState(false);

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">钱包</h1>
        <p className="text-muted-foreground">
          管理您的积分并查看交易历史
        </p>
      </div>

      <BalanceCard onTopUp={() => setShowNowPaymentsModal(true)} />

      {/* 充值选项卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            充值选项
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setShowNowPaymentsModal(true)}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Coins className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">加密货币充值</div>
                <div className="text-xs text-muted-foreground">
                  支持 BTC, ETH, USDT 等
                </div>
              </div>
            </Button>
            
            <Button
              disabled
              className="h-20 flex flex-col items-center justify-center gap-2 relative"
              variant="outline"
            >
              <CreditCard className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">传统支付</div>
                <div className="text-xs text-muted-foreground">
                  信用卡/借记卡支付
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 text-xs px-2 py-1"
              >
                Coming Soon
              </Badge>
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            * 所有充值方式均通过 NowPayments 安全处理
          </div>
        </CardContent>
      </Card>

      <TransactionHistory />

      <NowPaymentsTopupModal 
        open={showNowPaymentsModal} 
        onOpenChange={setShowNowPaymentsModal} 
      />
    </div>
  );
}

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Coins,
  CreditCard,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useAuth } from '@/shared/hooks/use-auth';
import { generateUUID } from '@/shared/utils';
import { type OrdersFilters, useOrders } from '../hooks/use-orders';

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
];

export function OrdersList() {
  const [filters, setFilters] = useState<OrdersFilters>({
    limit: 20,
    offset: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { did } = useAuth();

  const {
    orders,
    isLoading,
    error,
    totalCount,
    loadMoreOrders,
    refreshOrders,
    getOrdersByStatus,
    clearError,
  } = useOrders(did ?? undefined);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    const newFilters: OrdersFilters = {
      ...filters,
      status: status === 'all' ? undefined : [status],
      offset: 0,
    };
    setFilters(newFilters);
    refreshOrders(newFilters);
  };

  const handleRefresh = () => {
    clearError();
    refreshOrders(filters);
  };

  const handleLoadMore = () => {
    loadMoreOrders(filters);
  };

  const filteredOrders = searchTerm
    ? orders.filter(
      (order) =>
        order.nowpayments_payment_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    : orders;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option?.label || status;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">加载订单失败</CardTitle>
          <CardDescription>{error}</CardDescription>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>订单列表</CardTitle>
              <CardDescription>共 {totalCount} 个订单</CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              刷新
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 筛选器 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">搜索订单</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id={generateUUID()}
                  placeholder="搜索订单ID或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <Label htmlFor="status-filter">状态筛选</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 订单列表 */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {isLoading ? '加载中...' : '暂无订单'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? '正在获取您的订单记录' : '您还没有任何订单记录'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card
                  key={order.nowpayments_payment_id}
                  className="p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="space-y-4">
                    {/* 订单头部 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            #{order.nowpayments_payment_id.slice(-8)}
                          </span>
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="text-xs"
                          >
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {order.created_at
                          ? formatDistanceToNow(new Date(order.created_at), {
                            addSuffix: true,
                            locale: zhCN,
                          })
                          : '未知时间'}
                      </span>
                    </div>

                    {/* 订单描述 */}
                    {order.order_id && (
                      <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        订单ID: {order.order_id}
                      </p>
                    )}

                    {/* 金额信息卡片 */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              订单金额
                            </p>
                            <div
                              className="cursor-help group relative"
                              title={`完整金额: ${order.amount_fiat} ${order.currency_fiat}`}
                            >
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {Number(order.amount_fiat).toFixed(4)}{' '}
                                {order.currency_fiat}
                              </p>
                              {/* 悬停提示 */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                完整金额: {order.amount_fiat}{' '}
                                {order.currency_fiat}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/40 px-3 py-2 rounded-lg">
                            <Coins className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-700 dark:text-orange-300">
                              {order.pay_currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 交易信息 */}
                    {(order.nowpayments_payment_id || order.transfer_tx) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          转账哈希
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {order.transfer_tx && (
                            <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800">
                              <ExternalLink className="h-4 w-4 text-purple-600" />
                              <div>
                                <code className="text-sm font-mono text-purple-800 dark:text-purple-200">
                                  {order.transfer_tx.slice(0, 3)}...
                                  {order.transfer_tx.slice(-4)}
                                </code>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* 加载更多按钮 */}
          {filteredOrders.length < totalCount && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? '加载中...' : '加载更多'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v3';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Coins, AlertCircle, RefreshCw, Info, Search, X } from 'lucide-react';
import { useDevMode } from '@/shared/hooks/use-dev-mode';
import { useAuth } from '@/shared/hooks/use-auth';
import { useSupportedCryptos } from '../hooks/use-supported-cryptos';
import { useNowPayments } from '../hooks/use-nowpayments';
import { PaymentWindow } from './payment-window';

// 动态创建表单验证schema
const createFormSchema = (minAmount: number, cryptoUnit: string = 'USD') => z.object({
  amount: z
    .string()
    .min(1, '金额不能为空')
    .refine(
      (val) => !Number.isNaN(Number(val)),
      '请输入有效的数字',
    )
    .refine((val) => Number(val) > 0, '金额必须大于0')
    .refine(
      (val) => Number(val) <= 10000,
      '金额不能超过$10,000',
    )
    .refine(
      (val) => Number(val) >= minAmount,
      `最小充值金额为 ${minAmount} ${cryptoUnit}`,
    ),
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface NowPaymentsTopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NowPaymentsTopupModal({ open, onOpenChange }: NowPaymentsTopupModalProps) {
  const { cryptos, isLoading: isLoadingCryptos, error: cryptosError, refreshCryptos } = useSupportedCryptos();
  const { createPayment, getExchangeRate, getMinAmount } = useNowPayments();
  const { did } = useAuth();
  
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [isLoadingMinAmount, setIsLoadingMinAmount] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 获取选中的加密货币信息
  const selectedCryptoInfo = cryptos.find(crypto => crypto.value === selectedCrypto);
  const maxAmount = 10000; // 默认最大金额

  // 过滤加密货币列表
  const filteredCryptos = cryptos.filter(crypto => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      crypto.label.toLowerCase().includes(query) ||
      crypto.value.toLowerCase().includes(query) ||
      crypto.network?.toLowerCase().includes(query)
    );
  });

  // 处理加密货币选择
  const handleCryptoSelect = (cryptoValue: string) => {
    setSelectedCrypto(cryptoValue);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
  };

  // 清空搜索
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  // 获取加密货币单位
  const getCryptoUnit = (cryptoValue: string): string => {
    if (!cryptoValue) return 'USD';
    // 从value中提取基础代币名称（如usdtbsc -> usdt）
    const baseToken = cryptoValue.replace(/[A-Z]+$/, '').toUpperCase();
    return baseToken;
  };
  const cryptoUnit = getCryptoUnit(selectedCrypto);

  // 获取最小金额
  const fetchMinAmount = useCallback(async () => {
    if (!selectedCrypto) return;
    
    console.log('开始获取最小金额，selectedCrypto:', selectedCrypto);
    setIsLoadingMinAmount(true);
    try {
      const minAmountValue = await getMinAmount(selectedCrypto, 'USD');
      console.log('获取到的最小金额:', minAmountValue);
      setMinAmount(minAmountValue || 0);
    } catch (error) {
      console.error('获取最小金额失败:', error);
      setMinAmount(0);
    } finally {
      setIsLoadingMinAmount(false);
    }
  }, [selectedCrypto, getMinAmount]);

  // 获取汇率
  const fetchExchangeRate = useCallback(async () => {
    if (!selectedCrypto) return;
    
    console.log('开始获取汇率，selectedCrypto:', selectedCrypto);
    setIsLoadingRate(true);
    try {
      const rate = await getExchangeRate(selectedCrypto, 'USD', 1);
      console.log('获取到的汇率:', rate);
      setExchangeRate(rate);
    } catch (error) {
      console.error('获取汇率失败:', error);
      setExchangeRate(null);
    } finally {
      setIsLoadingRate(false);
    }
  }, [selectedCrypto, getExchangeRate]);

  // 当选择的加密货币变化时获取最小金额和汇率
  useEffect(() => {
    console.log('useEffect触发，selectedCrypto:', selectedCrypto, 'open:', open);
    if (selectedCrypto && open) {
      fetchMinAmount();
      fetchExchangeRate();
    }
  }, [selectedCrypto, open, fetchMinAmount, fetchExchangeRate]);

  // 点击外部关闭搜索下拉列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // 计算美元金额
  const calculateUSDAmount = useCallback((cryptoAmount: number): number => {
    if (!exchangeRate || cryptoAmount === 0) return 0;
    const result = cryptoAmount * exchangeRate;
    console.log('calculateUSDAmount:', {
      cryptoAmount,
      exchangeRate,
      result
    });
    return result;
  }, [exchangeRate]);

  // 动态创建表单schema
  const formSchema = createFormSchema(minAmount, cryptoUnit);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
    },
  });

  // 重置表单当选择的加密货币变化时
  useEffect(() => {
    if (selectedCrypto) {
      form.reset({ amount: '' });
    }
  }, [selectedCrypto, form]);

  // 预设金额选项
  const presetAmounts = [10, 50, 100, 500, 1000];

  const onSubmit = useCallback(async (data: FormData) => {
    if (!selectedCrypto) return;
    
    setIsSubmitting(true);
    try {
      const orderId = `nuwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('用户输入的加密货币金额:', data.amount);
      console.log('当前汇率:', exchangeRate);
      
      // 计算美元金额
      const usdAmount = calculateUSDAmount(Number(data.amount));
      console.log('计算出的美元金额:', usdAmount);
      
      const paymentRequest = {
        price_amount: usdAmount,
        price_currency: 'USD',
        order_id: orderId,
        order_description: `NUWA Client top-up - ${usdAmount.toFixed(2)} USD`,
        pay_currency: selectedCrypto,
        ipn_callback_url: `https://dc4749a6dde9.ngrok-free.app/webhook/nowpayments`,
        payer_did: did || undefined,
      };

      const paymentResponse = await createPayment(paymentRequest);
      
      if (paymentResponse) {
        setPaymentData(paymentResponse);
      }
    } catch (error) {
      console.error('创建支付失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCrypto, exchangeRate, calculateUSDAmount, createPayment]);

  const handlePaymentSuccess = useCallback(() => {
    setPaymentData(null);
    onOpenChange(false);
    form.reset();
  }, [onOpenChange, form]);

  const handlePaymentCancel = useCallback(() => {
    setPaymentData(null);
  }, []);

  // 如果正在显示支付窗口，显示支付界面
  if (paymentData) {
    return (
      <PaymentWindow
        open={open}
        onOpenChange={onOpenChange}
        paymentData={paymentData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            加密货币充值
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 加密货币选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">选择加密货币</label>
              <div className="relative" ref={searchRef}>
                {/* 搜索输入框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={isLoadingCryptos ? "加载中..." : "搜索加密货币..."}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    disabled={isLoadingCryptos}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* 下拉列表 */}
                {isSearchOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCryptos.length > 0 ? (
                      filteredCryptos.map((crypto) => (
                        <button
                          key={crypto.value}
                          type="button"
                          onClick={() => handleCryptoSelect(crypto.value)}
                          className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none flex items-center gap-2"
                        >
                          {crypto.icon ? (
                            <img 
                              src={crypto.icon} 
                              alt={crypto.label}
                              className="w-5 h-5 rounded-full flex-shrink-0"
                              onError={(e) => {
                                // 如果图片加载失败，隐藏图片元素
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
                              {crypto.value.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{crypto.label}</span>
                              {crypto.network && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">
                                  {crypto.network}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        未找到匹配的加密货币
                      </div>
                    )}
                  </div>
                )}

                {/* 已选择的加密货币显示 */}
                {selectedCrypto && selectedCryptoInfo && (
                  <div className="mt-2 p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      {selectedCryptoInfo.icon ? (
                        <img 
                          src={selectedCryptoInfo.icon} 
                          alt={selectedCryptoInfo.label}
                          className="w-5 h-5 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                          {selectedCryptoInfo.value.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium">{selectedCryptoInfo.label}</span>
                      {selectedCryptoInfo.network && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedCryptoInfo.network}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 错误提示 */}
            {cryptosError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {cryptosError}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={refreshCryptos}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    重试
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 最小金额提示 */}
            {selectedCrypto && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {isLoadingMinAmount ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      正在获取最小金额...
                    </div>
                  ) : (
                    `最小充值金额: ${minAmount} ${cryptoUnit}`
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* 充值金额输入 */}
            {selectedCrypto && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>充值金额 ({cryptoUnit})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.00000001"
                        placeholder={`输入充值金额 (最小 ${minAmount} ${cryptoUnit})`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 预设金额按钮 */}
            {selectedCrypto && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">快速选择:</div>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (preset < minAmount) {
                          form.setError('amount', {
                            message: `金额不能小于最小充值金额 ${minAmount} ${cryptoUnit}`,
                          });
                          return;
                        }
                        form.setValue('amount', preset.toString());
                        form.clearErrors('amount');
                      }}
                      disabled={preset < minAmount}
                    >
                      {preset} {cryptoUnit}
                    </Button>
                  ))}
                </div>
                {presetAmounts.some(preset => preset < minAmount) && (
                  <div className="text-xs text-muted-foreground">
                    部分选项因小于最小充值金额而禁用
                  </div>
                )}
              </div>
            )}

            {/* 充值信息卡片 */}
            {selectedCrypto && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>充值金额:</span>
                      <span className="font-medium">
                        {form.watch('amount') || '0'} {cryptoUnit}
                        {exchangeRate && (
                          <span className="text-muted-foreground ml-1">
                            (≈${calculateUSDAmount(Number(form.watch('amount') || 0)).toFixed(2)})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>加密货币:</span>
                      <span className="font-medium">{selectedCryptoInfo?.label || '加载中...'}</span>
                    </div>
                    {minAmount > 0 && (
                      <div className="flex justify-between">
                        <span>最小金额:</span>
                        <span className="font-medium">
                          {minAmount} {cryptoUnit}
                          {exchangeRate && (
                            <span className="text-muted-foreground ml-1">
                              (≈${calculateUSDAmount(minAmount).toFixed(2)})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      * 实际到账金额可能因汇率波动而略有差异
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 加载状态 */}
            {(isLoadingRate || isLoadingMinAmount) && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  {isLoadingMinAmount ? '正在获取最小金额...' : '正在获取汇率...'}
                </span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!selectedCrypto || isSubmitting || isLoadingRate || isLoadingMinAmount}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    创建支付中...
                  </>
                ) : (
                  '创建支付'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
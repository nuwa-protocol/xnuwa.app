import { useState, useCallback } from 'react';
import { WalletStore } from '../stores';
import { getConfig } from '@/shared/config/nowpayments';

export interface NowPaymentsPaymentRequest {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  pay_currency: string;
  ipn_callback_url?: string;
  success_url?: string;
  cancel_url?: string;
  payer_did?: string;
}

export interface NowPaymentsPaymentResponse {
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
}

export interface NowPaymentsMinAmountResponse {
  min_amount: number;
  currency_from: string;
  currency_to: string;
}

export interface NowPaymentsError {
  error: string;
  message: string;
}

export interface Order {
  id: string;
  did: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  payment_id?: string;
  order_description?: string;
}

export interface OrdersResponse {
  items: Order[];
  limit: number;
  offset: number;
  count: number;
}

export const useNowPayments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addTransaction, setBalance, balance } = WalletStore();

  const createPayment = useCallback(async (request: NowPaymentsPaymentRequest): Promise<NowPaymentsPaymentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const config = getConfig();
      
      // 构建API URL - 匹配后端路由 /api/payment
      const apiUrl = `${config.appUrl}/api/payment`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData: NowPaymentsError = await response.json();
        throw new Error(errorData.message || '创建支付失败');
      }

      const paymentData: NowPaymentsPaymentResponse = await response.json();
      return paymentData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建支付时发生未知错误';
      setError(errorMessage);
      console.error('NowPayments payment creation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);


  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<NowPaymentsPaymentResponse | null> => {
    try {
      const config = getConfig();
      const apiUrl = `${config.appUrl}/api/payments/${paymentId}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('检查支付状态失败');
      }

      const statusData: NowPaymentsPaymentResponse = await response.json();
      
      // 如果支付成功，更新本地余额和交易记录
      if (statusData.payment_status === 'finished' || statusData.payment_status === 'confirmed') {
        const amount = statusData.price_amount || 0;
        
        // 使用当前余额值而不是函数式更新
        setBalance(balance + amount);

        addTransaction({
          id: paymentId,
          type: 'deposit',
          label: '加密货币充值',
          amount: amount,
          timestamp: Date.now(),
          status: 'completed',
        });
      }

      return statusData;
    } catch (err) {
      console.error('Payment status check error:', err);
      return null;
    }
  }, [setBalance, addTransaction, balance]);

  const getSupportedCurrencies = useCallback(async (): Promise<string[]> => {
    try {
      const config = getConfig();
      const apiUrl = `${config.appUrl}/api/currencies`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('获取支持的货币失败');
      }

      const data = await response.json();
      return data.currencies || [];
    } catch (err) {
      console.error('Get supported currencies error:', err);
      return [];
    }
  }, []);

  const getExchangeRate = useCallback(async (fromCurrency: string, toCurrency: string = 'USD', amount: number = 1): Promise<number | null> => {
    try {
      const config = getConfig();
      const apiUrl = `${config.appUrl}/api/estimate?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`;

      const response = await fetch(apiUrl);
      console.log('Exchange rate request:', apiUrl);
      
      if (!response.ok) {
        throw new Error('获取汇率失败');
      }

      const data = await response.json();
      console.log('Exchange rate response:', data);
      
      // 从estimate响应中提取汇率
      // 假设响应格式为 { estimated_amount: number, ... }
      if (data.estimated_amount) {
        return data.estimated_amount / amount; // 计算单位汇率
      }
      
      return null;
    } catch (err) {
      console.error('Get exchange rate error:', err);
      return null;
    }
  }, []);

  const getMinAmount = useCallback(async (fromCurrency: string, toCurrency: string = 'USD'): Promise<number | null> => {
    try {
      const config = getConfig();
      const apiUrl = `${config.appUrl}/api/min-amount?from=${fromCurrency}&to=${toCurrency}`;

      const response = await fetch(apiUrl);
      console.log('Min amount request:', apiUrl);
      
      if (!response.ok) {
        throw new Error('获取最小金额失败');
      }

      const data: NowPaymentsMinAmountResponse = await response.json();
      console.log('Min amount response:', data);
      
      return data.min_amount;
    } catch (err) {
      console.error('Get min amount error:', err);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 获取配置信息（用于调试）
  const getUserOrders = useCallback(async (
    did: string,
    options: {
      status?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<OrdersResponse | null> => {
    try {
      const config = getConfig();
      const { status = [], limit = 50, offset = 0 } = options;
      
      // 构建查询参数
      const params = new URLSearchParams();
      if (status.length > 0) {
        params.append('status', status.join(','));
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      const apiUrl = `${config.appUrl}/api/users/${did}/orders?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('获取用户订单失败');
      }

      const data: OrdersResponse = await response.json();
      return data;
    } catch (err) {
      console.error('Get user orders error:', err);
      return null;
    }
  }, []);

  const getConfigInfo = useCallback(() => {
    const config = getConfig();
    return {
      appUrl: config.appUrl,
      appName: config.appName,
      isDevelopment: config.isDevelopment,
    };
  }, []);

  return {
    createPayment,
    checkPaymentStatus,
    getSupportedCurrencies,
    getExchangeRate,
    getMinAmount,
    getUserOrders,
    getConfig: getConfigInfo,
    isLoading,
    error,
    clearError,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { getConfig } from "@/shared/config/nowpayments.ts";

export interface CryptoCurrency {
  value: string;
  label: string;
  icon: string;
  network?: string;
  logoUrl?: string;
  walletRegex?: string;
  extraIdExists?: boolean;
  extraIdRegex?: string;
  track?: boolean;
  cgId?: string;
  isMaxLimit?: boolean;
  smartContract?: string;
  networkPrecision?: number;
}

// API货币数据接口
interface ApiCurrency {
  id: number;
  code: string;
  name: string;
  enable: boolean;
  wallet_regex: string;
  priority: number;
  extra_id_exists: boolean;
  extra_id_regex: string | null;
  logo_url: string;
  track: boolean;
  cg_id: string;
  is_maxlimit: boolean;
  network: string;
  smart_contract: string | null;
  network_precision: number | null;
}

// 生成图标URL
const generateIconUrl = (logoUrl: string): string => {
  if (logoUrl) {
    // 如果logoUrl已经是完整的URL，直接返回
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // 否则拼接nowpayments.io域名
    return `https://nowpayments.io${logoUrl}`;
  }
  return '';
};

// 创建加密货币对象
const createCryptoCurrency = (apiCurrency: ApiCurrency): CryptoCurrency => {
  const iconUrl = generateIconUrl(apiCurrency.logo_url);
  console.log(`处理货币 ${apiCurrency.code}:`, {
    originalLogoUrl: apiCurrency.logo_url,
    generatedIconUrl: iconUrl
  });
  
  return {
    value: apiCurrency.code.toLowerCase(),
    label: `${apiCurrency.name} (${apiCurrency.code})`,
    icon: iconUrl,
    network: apiCurrency.network,
    logoUrl: apiCurrency.logo_url,
    walletRegex: apiCurrency.wallet_regex,
    extraIdExists: apiCurrency.extra_id_exists,
    extraIdRegex: apiCurrency.extra_id_regex || undefined,
    track: apiCurrency.track,
    cgId: apiCurrency.cg_id,
    isMaxLimit: apiCurrency.is_maxlimit,
    smartContract: apiCurrency.smart_contract || undefined,
    networkPrecision: apiCurrency.network_precision || undefined,
  };
};

// 默认加密货币列表
const defaultCryptos: CryptoCurrency[] = [];

// API数据处理函数
const processApiCurrencies = (currencies: ApiCurrency[]): CryptoCurrency[] => {
  console.log('处理API货币数据:', currencies);
  
  // 过滤启用的货币并按优先级排序
  const enabledCurrencies = currencies
    .filter(currency => currency.enable)
    .sort((a, b) => b.priority - a.priority);
  
  console.log('启用的货币数量:', enabledCurrencies.length);
  
  // 转换为CryptoCurrency格式
  const formattedCryptos = enabledCurrencies.map(createCryptoCurrency);
  
  console.log('格式化后的加密货币:', formattedCryptos.map(c => c.value));
  
  return formattedCryptos;
};

export const useSupportedCryptos = () => {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>(defaultCryptos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupportedCryptos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getConfig();

    try {
      const response = await fetch(`${config.appUrl}/api/full-currencies`);

      if (!response.ok) {
        throw new Error('获取支持的加密货币失败');
      }

      const data = await response.json();
      console.log('API响应数据:', data);
      
      if (!data.currencies || !Array.isArray(data.currencies)) {
        throw new Error('API返回数据格式错误');
      }

      const processedCryptos = processApiCurrencies(data.currencies);
      setCryptos(processedCryptos);
    } catch (err) {
      console.warn('Failed to fetch supported cryptocurrencies, using default list:', err);
      setError(err instanceof Error ? err.message : '获取支持的加密货币失败');
      setCryptos(defaultCryptos);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 组件挂载时获取支持的加密货币
  useEffect(() => {
    fetchSupportedCryptos();
  }, [fetchSupportedCryptos]);

  // 手动刷新支持的加密货币
  const refreshCryptos = useCallback(() => {
    fetchSupportedCryptos();
  }, [fetchSupportedCryptos]);

  return {
    cryptos,
    isLoading,
    error,
    refreshCryptos,
  };
};
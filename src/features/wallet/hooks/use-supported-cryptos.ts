import { useCallback, useEffect, useState } from 'react';
import { getConfig } from '@/shared/config/nowpayments.ts';

export interface CryptoCurrency {
  value: string;
  name: string;
  code: string;
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

// API Currency data interface
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

// Generate icon URL
const generateIconUrl = (logoUrl: string): string => {
  if (logoUrl) {
    // If logoUrl is already a full URL, return it directly
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    // Otherwise, concatenate nowpayments.io domain name
    return `https://nowpayments.io${logoUrl}`;
  }
  return '';
};

// Create crypto currency object
const createCryptoCurrency = (apiCurrency: ApiCurrency): CryptoCurrency => {
  const iconUrl = generateIconUrl(apiCurrency.logo_url);

  return {
    value: apiCurrency.code.toLowerCase(),
    name: apiCurrency.name,
    code: apiCurrency.code,
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

// Default crypto currency list
const defaultCryptos: CryptoCurrency[] = [];

// API data processing function
const processApiCurrencies = (currencies: ApiCurrency[]): CryptoCurrency[] => {
  // Filter enabled currencies and sort by priority
  const enabledCurrencies = currencies
    .filter((currency) => currency.enable)
    .sort((a, b) => b.priority - a.priority);

  // Convert to CryptoCurrency format
  const formattedCryptos = enabledCurrencies.map(createCryptoCurrency);

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
        throw new Error('Failed to fetch supported cryptocurrencies');
      }

      const data = await response.json();

      if (!data.currencies || !Array.isArray(data.currencies)) {
        throw new Error('API returned data format error');
      }

      const processedCryptos = processApiCurrencies(data.currencies);
      setCryptos(processedCryptos);
    } catch (err) {
      console.error(
        'Failed to fetch supported cryptocurrencies, using default list:',
        err,
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch supported cryptocurrencies',
      );
      setCryptos(defaultCryptos);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When the component is mounted, fetch the supported cryptocurrencies
  useEffect(() => {
    fetchSupportedCryptos();
  }, [fetchSupportedCryptos]);

  // Manually refresh supported cryptocurrencies
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

import { useEffect, useState } from 'react';
import { supportedCurrencies } from '../constants';
import { getSupportedCurrencies } from '../services/deposit';
import type { Currency } from '../types';

export const usePaymentCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manually refresh supported cryptocurrencies
  const fetchCurrencies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currencies = await getSupportedCurrencies();
      setCurrencies(
        currencies.filter((currency) =>
          supportedCurrencies.includes(currency.code),
        ),
      );
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
      setCurrencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // When the component is mounted, fetch the supported cryptocurrencies
  useEffect(() => {
    fetchCurrencies();
  }, []);

  return {
    currencies,
    isLoading,
    error,
    fetchCurrencies,
  };
};

import { useCallback, useEffect, useRef } from 'react';
import { WalletStore } from '../stores';

/**
 * Manage the timing of wallet balance data fetching
 * Use this hook in places where you need to control data refreshing, not in display components
 */
export function useWalletBalanceManager() {
  const { fetchPaymentBalance } = WalletStore();
  const lastFetchRef = useRef<number>(0);

  const fetchWithThrottle = useCallback(
    async (force = false) => {
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchRef.current;

      // Do not repeat requests within 30 seconds, unless forced to refresh
      if (!force && timeSinceLastFetch < 30000) {
        return;
      }

      lastFetchRef.current = now;
      await fetchPaymentBalance();
    },
    [fetchPaymentBalance],
  );

  // Fetch once when initializing
  useEffect(() => {
    fetchWithThrottle(true);
  }, [fetchWithThrottle]);

  // Refresh when the page is focused (with throttling)
  useEffect(() => {
    const handleFocus = () => {
      fetchWithThrottle();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchWithThrottle]);

  return {
    // Manual refresh (forced)
    refreshBalance: () => fetchWithThrottle(true),
    // Refresh with throttling
    refreshBalanceThrottled: () => fetchWithThrottle(),
  };
}

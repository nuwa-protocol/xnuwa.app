import { useEffect, useState } from 'react';
import { capKitService } from '@/shared/services/capkit-service';
import type { RatingDistribution } from '@nuwa-ai/cap-kit';
interface UseCapRatingDistributionResult {
  distribution: RatingDistribution[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch rating distribution data for a specific cap
 * @param capId - The ID of the cap to fetch rating distribution for
 * @returns Object containing distribution data, loading state, error, and refetch function
 */
export function useCapRatingDistribution(capId: string): UseCapRatingDistributionResult {
  const [distribution, setDistribution] = useState<RatingDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatingDistribution = async () => {
    if (!capId) return;

    setIsLoading(true);
    setError(null);

    try {
      const capKit = await capKitService.getCapKit();
      const response = await capKit.queryCapRatingDistribution(capId);
      
      // Transform the response data to match our expected format
      // Assuming the API returns data in a format like { data: { 1: count, 2: count, ... } }
      
      // if (response.data) {
      //   // Convert the response to our format, ensuring we have entries for all star ratings 1-5
      //   for (let stars = 1; stars <= 5; stars++) {
      //     distributionData.push({
      //       stars,
      //       count: response.data[stars] || 0,
      //     });
      //   }
        
      //   // Sort by stars in descending order (5 stars first)
      //   distributionData.sort((a, b) => b.stars - a.stars);
      // }

      setDistribution((response.data || []).reverse());
    } catch (err) {
      console.error('Failed to fetch rating distribution:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rating distribution');
      
      // Set empty distribution as fallback
      setDistribution([
        { rating: 5, count: 0 },
        { rating: 4, count: 0 },
        { rating: 3, count: 0 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatingDistribution();
  }, [capId]);

  return {
    distribution,
    isLoading,
    error,
    refetch: fetchRatingDistribution,
  };
}

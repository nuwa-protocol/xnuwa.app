import { useCallback, useState } from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import type { Cap } from '@/shared/types/cap';
import type { LocalCap } from '../types';

interface CapSubmitResponse {
  success: boolean;
  capId?: string;
  message: string;
  errors?: string[];
}

interface BulkSubmitProgress {
  total: number;
  completed: number;
  currentCap?: string;
  isSubmitting: boolean;
  errors: Array<{ capName: string; error: string }>;
}

export const useSubmitCap = () => {
  const { capKit } = useCapKit();
  const [bulkProgress, setBulkProgress] = useState<BulkSubmitProgress>({
    total: 0,
    completed: 0,
    isSubmitting: false,
    errors: [],
  });

  const submitCap = useCallback(
    async (capData: Cap): Promise<CapSubmitResponse> => {
      try {
        if (!capKit) {
          throw new Error('Failed to initialize CapKit');
        }

        // Register the capability using CapKit
        const cid = await capKit.registerCap(capData);

        return {
          success: true,
          capId: cid,
          message: `Capability "@${capData.idName}" registered successfully with CID: ${cid}`,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to submit capability';
        return {
          success: false,
          message: errorMessage,
          errors: [errorMessage],
        };
      }
    },
    [capKit],
  );

  const bulkSubmitCaps = useCallback(
    async (caps: LocalCap[]): Promise<void> => {
      if (!capKit) {
        throw new Error('Failed to initialize CapKit');
      }

      setBulkProgress({
        total: caps.length,
        completed: 0,
        isSubmitting: true,
        errors: [],
      });

      const errors: Array<{ capName: string; error: string }> = [];

      for (let i = 0; i < caps.length; i++) {
        const cap = caps[i];
        const displayName = cap.capData.metadata.displayName;

        setBulkProgress((prev) => ({
          ...prev,
          currentCap: displayName,
        }));

        try {
          await capKit.registerCap(cap.capData);
          setBulkProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to submit capability';
          errors.push({ capName: displayName, error: errorMessage });
          setBulkProgress((prev) => ({
            ...prev,
            completed: prev.completed + 1,
            errors: [
              ...prev.errors,
              { capName: displayName, error: errorMessage },
            ],
          }));
        }
      }

      setBulkProgress((prev) => ({
        ...prev,
        isSubmitting: false,
        currentCap: undefined,
      }));
    },
    [capKit],
  );

  return {
    submitCap,
    bulkSubmitCaps,
    bulkProgress,
  };
};

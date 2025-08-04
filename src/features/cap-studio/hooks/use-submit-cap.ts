import { useCallback } from 'react';
import { useCapKitInit } from '@/shared/hooks/use-cap-kit-init';
import type { LocalCap } from '../types';

export interface CapSubmitRequest {
  name: string;
  description: string;
  cap: LocalCap;
  capSubmissionMetadata: {
    author: string;
    homepage?: string;
    repository?: string;
    thumbnail?: string;
  };
}

interface CapSubmitResponse {
  success: boolean;
  capId?: string;
  message: string;
  errors?: string[];
}

export const useSubmitCap = () => {
  // // mock
  // const submitCap = () => {};
  // const isInitializing = true;

  const { initializeCapKit, isInitializing } = useCapKitInit();

  const submitCap = useCallback(
    async (request: CapSubmitRequest): Promise<CapSubmitResponse> => {
      try {
        const kit = await initializeCapKit();
        if (!kit) {
          throw new Error('Failed to initialize CapKit');
        }

        // Register the capability using CapKit
        const cid = await kit.registerCap(request.name, request.description, {
          cap: request.cap,
          capSubmissionMetadata: request.capSubmissionMetadata,
        });

        return {
          success: true,
          capId: cid,
          message: `Capability "${request.name}" registered successfully with CID: ${cid}`,
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
    [initializeCapKit],
  );

  return {
    submitCap,
    isInitializing,
  };
};

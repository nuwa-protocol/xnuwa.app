"use client";

import { useState, useCallback } from "react";
import type { Document } from "@/features/documents/types";
import { useLanguage } from "@/shared/hooks/use-language";
import { useDocuments } from "./use-documents";

// Version management hook for document operations
export const useVersionManagement = () => {
  const [isMutating, setIsMutating] = useState(false);
  const { deleteAfterTimestamp } = useDocuments();
  const { t } = useLanguage();

  const restoreToVersion = useCallback(
    async (
      documentId: string,
      documents: Document[],
      currentVersionIndex: number,
      onSuccess?: () => void
    ) => {
      setIsMutating(true);

      try {
        const currentDocument = documents[currentVersionIndex];
        if (currentDocument) {
          // Update document to the selected version's content
          await deleteAfterTimestamp(documentId, {
            content: currentDocument.content ?? "",
            timestamp: currentDocument.createdAt,
          });

          // Call success callback
          onSuccess?.();
        }
      } catch (error) {
        console.error(t("version.failedRestore"), error);
        throw error;
      } finally {
        setIsMutating(false);
      }
    },
    [deleteAfterTimestamp, t]
  );

  return {
    isMutating,
    restoreToVersion,
  };
};

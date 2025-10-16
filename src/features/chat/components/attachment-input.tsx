import { PaperclipIcon } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useId } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { convertFileToDataURL } from '../utils/files';

export interface AttachmentData {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
}

export const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_ATTACHMENT_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Documents
  'application/pdf',

  // Text files
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',

  // Code files
  'text/typescript',
  'text/x-python',
  'text/x-java',
  'text/x-c',
  'text/x-cpp',
] as const;

export const ACCEPTED_IMAGE_TYPES = ACCEPTED_ATTACHMENT_TYPES.filter((type) =>
  type.startsWith('image/'),
);

interface AttachmentInputProps {
  attachments: AttachmentData[];
  onAttachmentsChange: (attachments: AttachmentData[]) => void;
}

export function AttachmentInput({
  attachments,
  onAttachmentsChange,
}: AttachmentInputProps) {
  const fileInputId = useId();

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate files
      Array.from(files).forEach((file) => {
        // Check file size
        if (file.size > MAX_ATTACHMENT_SIZE) {
          errors.push(
            `${file.name} exceeds maximum size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`,
          );
          return;
        }

        // Check file type
        if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type as never)) {
          errors.push(`${file.name} has unsupported file type: ${file.type}`);
          return;
        }

        validFiles.push(file);
      });

      // Show validation errors
      if (errors.length > 0) {
        toast.error(errors.join(', '));
      }

      // Convert valid files to attachments
      try {
        const newAttachments = await Promise.all(
          validFiles.map(async (file) => ({
            type: 'file' as const,
            filename: file.name,
            mediaType: file.type,
            url: await convertFileToDataURL(file),
          })),
        );

        onAttachmentsChange([...attachments, ...newAttachments]);
      } catch (error) {
        console.error('Error converting files:', error);
        toast.error('Failed to process files');
      }
    },
    [attachments, onAttachmentsChange],
  );

  return (
    <>
      {/* File Input */}
      <input
        type="file"
        id={fileInputId}
        multiple
        accept={ACCEPTED_ATTACHMENT_TYPES.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        data-testid="file-input"
      />
      {/* Attachment Toggle Button */}
      <Button
        type="button"
        onClick={() => {
          const fileInput = document.getElementById(
            fileInputId,
          ) as HTMLInputElement;
          fileInput?.click();
        }}
        variant="ghost"
        size="sm"
        className={`p-1.5 h-fit rounded-md hover:bg-accent`}
        data-testid="attachment-toggle"
      >
        <PaperclipIcon size={14} />
      </Button>
    </>
  );
}

interface UsePasteAttachmentsParams {
  onAttachmentsAdd: (attachments: AttachmentData[]) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}

export function usePasteAttachments({
  onAttachmentsAdd,
  inputRef,
}: UsePasteAttachmentsParams) {
  const handleClipboardData = useCallback(
    (
      clipboardData: DataTransfer | null,
      preventDefault?: () => void,
      { focusInput = true } = {},
    ) => {
      if (!clipboardData) return false;

      const imageFiles = Array.from(clipboardData.items)
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((file): file is File => {
          if (!file) return false;
          const fileType = file.type || 'image/png';
          return (
            fileType.startsWith('image/') ||
            ACCEPTED_IMAGE_TYPES.includes(fileType as never)
          );
        });

      if (imageFiles.length === 0) return false;

      preventDefault?.();

      const validFiles: File[] = [];
      const errors: string[] = [];

      imageFiles.forEach((file) => {
        const fileType = file.type || 'image/png';

        if (!ACCEPTED_IMAGE_TYPES.includes(fileType as never)) {
          errors.push(`Unsupported image type: ${fileType}`);
          return;
        }

        if (file.size > MAX_ATTACHMENT_SIZE) {
          errors.push(
            `${file.name || 'Pasted image'} exceeds maximum size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`,
          );
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        toast.error(errors.join(', '));
      }

      if (validFiles.length === 0) return true;

      if (focusInput) {
        inputRef?.current?.focus();
      }

      (async () => {
        try {
          const timestamp = Date.now();
          const newAttachments = await Promise.all(
            validFiles.map(async (file, index) => ({
              type: 'file' as const,
              filename:
                file.name || `pasted-image-${timestamp}-${index + 1}.png`,
              mediaType: file.type || 'image/png',
              url: await convertFileToDataURL(file),
            })),
          );

          onAttachmentsAdd(newAttachments);
        } catch (error) {
          console.error('Failed to process pasted images:', error);
          toast.error('Failed to process pasted images');
        }
      })();

      return true;
    },
    [inputRef, onAttachmentsAdd],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      handleClipboardData(event.clipboardData, () => event.preventDefault());
    },
    [handleClipboardData],
  );

  useEffect(() => {
    const isEditableElement = (element: HTMLElement | null) => {
      if (!element) return false;
      const editableSelectors =
        'input, textarea, [contenteditable="true"], [contenteditable=""]';
      return element.closest(editableSelectors) !== null;
    };

    const onPaste = (event: ClipboardEvent) => {
      const rawTarget = event.target;
      const target = rawTarget instanceof HTMLElement ? rawTarget : null;
      const inputElement = inputRef?.current;

      if (inputElement && target === inputElement) {
        return;
      }

      if (isEditableElement(target)) {
        return;
      }

      handleClipboardData(event.clipboardData, () => event.preventDefault());
    };

    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('paste', onPaste);
    };
  }, [handleClipboardData, inputRef]);

  return handlePaste;
}

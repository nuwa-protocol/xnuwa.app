import { PaperclipIcon } from 'lucide-react';
import { useCallback, useId } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { convertFileToDataURL } from '../utils/files';

export interface AttachmentData {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
}

interface AttachmentInputProps {
  attachments: AttachmentData[];
  onAttachmentsChange: (attachments: AttachmentData[]) => void;
}

export function AttachmentInput({
  attachments,
  onAttachmentsChange,
}: AttachmentInputProps) {
  const fileInputId = useId();

  // File constraints
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const ACCEPTED_FILE_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

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
  ];

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validate files
      Array.from(files).forEach((file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            `${file.name} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          );
          return;
        }

        // Check file type
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
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

  // Remove attachment
  const removeAttachment = useCallback(
    (index: number) => {
      const newAttachments = attachments.filter((_, i) => i !== index);
      onAttachmentsChange(newAttachments);
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
        accept={ACCEPTED_FILE_TYPES.join(',')}
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
        className={`p-1.5 h-fit rounded-md hover:bg-accent ${attachments.length > 0 ? 'bg-accent text-primary' : ''}`}
        data-testid="attachment-toggle"
      >
        <PaperclipIcon size={14} />
      </Button>
    </>
  );
}

import { FileText, Loader2, Upload } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui';
import type { LocalCap } from '../../types';
import type { SubmitFormData } from './submit-form';

interface SubmissionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SubmitFormData;
  cap: LocalCap;
  thumbnail: File | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function SubmissionConfirmationDialog({
  open,
  onOpenChange,
  data,
  cap,
  thumbnail,
  isSubmitting,
  onCancel,
  onConfirm,
}: SubmissionConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Submission</DialogTitle>
          <DialogDescription>
            Please review your cap information before submitting to the store
          </DialogDescription>
        </DialogHeader>
        <CapStorePreview data={data} cap={cap} thumbnail={thumbnail} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Go Back
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Confirm Submit
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CapStorePreviewProps {
  data: SubmitFormData;
  cap: LocalCap;
  thumbnail?: File | null;
}

function CapStorePreview({ data, cap, thumbnail }: CapStorePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-4">
        {thumbnail ? (
          <img
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail"
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold">
            {cap.capData.metadata.displayName || 'Untitled Cap'}
          </h3>
          <p className="text-muted-foreground">
            by {data.author || 'Unknown Author'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold mb-2">Description</h4>
        <p className="text-muted-foreground">
          {cap.capData.metadata.description || 'No description provided'}
        </p>
      </div>
      {/* Links */}
      {(data.homepage || data.repository) && (
        <div>
          <h4 className="font-semibold mb-2">Links</h4>
          <div className="space-y-1 text-sm">
            {data.homepage && (
              <div>
                <span className="text-muted-foreground">Homepage:</span>
                <a
                  href={data.homepage}
                  className="ml-2 text-primary hover:underline"
                >
                  {data.homepage}
                </a>
              </div>
            )}
            {data.repository && (
              <div>
                <span className="text-muted-foreground">Repository:</span>
                <a
                  href={data.repository}
                  className="ml-2 text-primary hover:underline"
                >
                  {data.repository}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

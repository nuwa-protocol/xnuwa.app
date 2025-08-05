import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button, Card, CardContent, Form } from '@/shared/components/ui';
import type { LocalCap } from '../../types';
import { AuthorForm } from './author-form';
import { CapInformation } from './cap-information';
import { SubmissionConfirmationDialog } from './submission-confirmation-dialog';
import { ThumbnailUpload } from './thumbnail-upload';

const submitSchema = z.object({
  author: z.string().min(1, 'Author name is required'),
  homepage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  repository: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitFormProps {
  cap: LocalCap;
  onSubmit?: (success: boolean, capId?: string) => void;
  onCancel?: () => void;
  onConfirmedSubmit: (
    data: SubmitFormData,
    thumbnailFile: File | null,
  ) => Promise<void>;
}

export function SubmitForm({
  cap,
  onSubmit,
  onCancel,
  onConfirmedSubmit,
}: SubmitFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      author: '',
      homepage: '',
      repository: '',
    },
  });

  const watchedData = form.watch();

  const handleFormSubmit = async () => {
    // Trigger validation and show errors
    const isValid = await form.trigger();

    if (!isValid) {
      // Form will show validation errors automatically
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    const data = form.getValues();
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      await onConfirmedSubmit(data, thumbnailFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit cap. Please try again.';
      toast.error(errorMessage);

      onSubmit?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: keyof SubmitFormData) => {
    form.trigger(fieldName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Submit Cap to Store</h3>
          <p className="text-sm text-muted-foreground">
            Publish @{cap.capData.idName} to the Nuwa Cap Store for others to
            discover and use
          </p>
        </div>

        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFormSubmit();
          }}
          className="space-y-6"
        >
          {/* Cap Information - Read Only */}
          <CapInformation cap={cap} />

          {/* Author */}
          <AuthorForm
            control={form.control}
            onFieldChange={handleFieldChange}
          />

          {/* Thumbnail Upload */}
          <ThumbnailUpload
            thumbnailFile={thumbnailFile}
            onFileChange={setThumbnailFile}
          />

          {/* Submit */}
          <Card className="border-none shadow-none">
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    {form.formState.isValid ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Ready to submit</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>Please complete all required fields</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {onCancel && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} size="lg">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit to Store
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      <SubmissionConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        data={watchedData}
        cap={cap}
        thumbnail={thumbnailFile}
        isSubmitting={isSubmitting}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSubmit}
      />
    </div>
  );
}

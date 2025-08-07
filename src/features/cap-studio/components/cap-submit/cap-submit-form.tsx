import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { Button, Card, CardContent, Form } from '@/shared/components/ui';
import { useSubmitForm } from '../../hooks/use-submit-form';
import type { LocalCap } from '../../types';
import { AuthorForm } from './author-form';
import { CapInformation } from './cap-information';
import { SubmissionConfirmationDialog } from './submission-confirmation-dialog';
import { ThumbnailUpload } from './thumbnail-upload';

interface CapSubmitFormProps {
  cap: LocalCap;
}

export function CapSubmitForm({ cap }: CapSubmitFormProps) {
  const {
    form,
    handleCancel,
    handleFormSubmit,
    handleConfirmedSubmit,
    handleFieldChange,
    isSubmitting,
    showConfirmDialog,
    thumbnail,
    setThumbnail,
    setShowConfirmDialog,
    watchedData,
  } = useSubmitForm({ cap });

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

        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
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
            thumbnail={thumbnail}
            onThumbnailChange={setThumbnail}
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
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
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
        thumbnail={thumbnail}
        isSubmitting={isSubmitting}
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmedSubmit}
      />
    </div>
  );
}

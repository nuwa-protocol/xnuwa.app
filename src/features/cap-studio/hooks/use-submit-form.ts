import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useLocalCapsHandler } from '../hooks/use-local-caps-handler';
import { useSubmitCap } from '../hooks/use-submit-cap';
import type { LocalCap } from '../types';

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

interface UseSubmitFormProps {
  cap: LocalCap;
}

export const useSubmitForm = ({ cap }: UseSubmitFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { updateCap } = useLocalCapsHandler();
  const { submitCap } = useSubmitCap();

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      author: '',
      homepage: '',
      repository: '',
    },
  });

  const watchedData = form.watch();

  const handleCancel = () => {
    navigate('/cap-studio');
  };

  const processConfirmedSubmit = async (
    submitFormData: SubmitFormData,
    thumbnailFile: File | null,
  ) => {
    try {
      // Convert thumbnail file to base64 if provided
      let thumbnailBase64: string | undefined;
      if (thumbnailFile) {
        thumbnailBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(thumbnailFile);
        });
      }

      const capWithSubmitFormData = {
        ...cap.capData,
        metadata: {
          ...cap.capData.metadata,
          author: submitFormData.author,
          homepage: submitFormData.homepage || undefined,
          repository: submitFormData.repository || undefined,
          thumbnail: thumbnailBase64,
        },
      };

      // make the submission
      const result = await submitCap(capWithSubmitFormData);

      if (result.success) {
        // update cap status to submitted
        updateCap(cap.id, { status: 'submitted', cid: result.capId });

        toast.success(result.message);

        navigate('/cap-studio');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit cap. Please try again.';
      toast.error(errorMessage);

      navigate('/cap-studio');
    }
  };

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
      await processConfirmedSubmit(data, thumbnailFile);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit cap. Please try again.';
      toast.error(errorMessage);

      navigate('/cap-studio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (fieldName: keyof SubmitFormData) => {
    form.trigger(fieldName);
  };

  return {
    form,
    handleCancel,
    handleFormSubmit,
    handleConfirmedSubmit,
    handleFieldChange,
    isSubmitting,
    showConfirmDialog,
    thumbnailFile,
    setThumbnailFile,
    setShowConfirmDialog,
    watchedData,
  };
};

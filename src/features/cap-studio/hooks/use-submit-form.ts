import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { CapThumbnail } from '@/shared/types';
import { useSubmitCap } from '../hooks';
import { CapStudioStore } from '../stores';
import type { LocalCap } from '../types';

interface UseSubmitFormProps {
  cap: LocalCap;
}

export const useSubmitForm = ({ cap }: UseSubmitFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { updateCap } = CapStudioStore();
  const { submitCap } = useSubmitCap();

  const handleCancel = () => {
    navigate('/cap-studio');
  };

  const handleDirectSubmit = async (
    thumbnail?: CapThumbnail,
    homepage?: string,
    repository?: string,
  ) => {
    setIsSubmitting(true);

    const submitFormData = {
      homepage: homepage || '',
      repository: repository || '',
    };

    try {
      // make the submission
      const result = await submitCap(cap.capData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // update cap status to submitted
      updateCap(cap.id, {
        ...cap,
        status: 'submitted',
        cid: result.capId,
      });

      toast.success(result.message);

      navigate('/cap-studio');
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

  return {
    handleCancel,
    handleDirectSubmit,
    isSubmitting,
  };
};

import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/shared/components';
import { useLocalCaps } from '../../hooks';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import { useSubmitCap } from '../../hooks/use-submit-cap';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { SubmitForm, type SubmitFormData } from './submit-form';

export function Submit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const localCaps = useLocalCaps();
  const { updateCap } = useLocalCapsHandler();
  const { submitCap } = useSubmitCap();

  const cap = localCaps.find((cap) => cap.id === id);

  if (!cap) {
    return (
      <DashboardLayout>
        <DashboardHeader
          title="Cap Not Found"
          description="The cap you're trying to submit could not be found"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cap not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (success: boolean, capId?: string) => {
    if (success) {
      navigate('/cap-studio');
    }
  };

  const handleCancel = () => {
    navigate('/cap-studio');
  };

  const handleConfirmedSubmit = async (
    submitFormData: SubmitFormData,
    thumbnailFile: File | null,
  ) => {
    try {
      const capWithSubmitFormData = {
        ...cap.capData,
        metadata: {
          ...cap.capData.metadata,
          author: submitFormData.author,
          homepage: submitFormData.homepage || undefined,
          repository: submitFormData.repository || undefined,
          thumbnail: thumbnailFile
            ? URL.createObjectURL(thumbnailFile)
            : undefined,
        },
      };

      // make the submission
      const result = await submitCap(capWithSubmitFormData);

      console.log('result', result);

      if (result.success) {
        // update cap status to submitted
        updateCap(cap.id, { status: 'submitted', cid: result.capId });

        toast({
          type: 'success',
          description: result.message,
        });

        handleSubmit(true, result.capId);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit cap. Please try again.';
      toast({
        type: 'error',
        description: errorMessage,
      });

      handleSubmit(false);
    }
  };

  return (
    <DashboardLayout>
      <SubmitForm
        cap={cap}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onConfirmedSubmit={handleConfirmedSubmit}
      />
    </DashboardLayout>
  );
}

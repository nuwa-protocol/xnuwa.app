import { useNavigate, useParams } from 'react-router-dom';
import { type CapSubmitRequest, mockSubmitCap } from '@/mocks/submit-caps';
import { toast } from '@/shared/components';
import { useLocalCaps } from '../../hooks';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { SubmitForm, type SubmitFormData } from './submit-form';

export function Submit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const localCaps = useLocalCaps();
  const { updateCap } = useLocalCapsHandler();

  const cap = localCaps.find((cap) => cap.id === id);

  const handleSubmit = (success: boolean, capId?: string) => {
    if (success) {
      navigate('/cap-studio');
    }
  };

  const handleCancel = () => {
    navigate('/cap-studio');
  };

  const handleConfirmedSubmit = async (
    data: SubmitFormData,
    thumbnailFile: File | null,
  ) => {
    try {
      // prepare submit request
      const submitRequest: CapSubmitRequest = {
        cap: cap!,
        metadata: {
          name: data.name,
          description: data.description,
          tags: data.tags,
          author: data.author,
          homepage: data.homepage || undefined,
          repository: data.repository || undefined,
          changelog: undefined,
        },
      };

      // use mock function to submit
      const result = await mockSubmitCap(submitRequest);

      if (result.success) {
        // update cap status to submitted
        updateCap(cap!.id, { status: 'submitted' });

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

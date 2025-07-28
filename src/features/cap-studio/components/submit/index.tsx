import { useNavigate, useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { SubmitForm } from './submit-form';

export function Submit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const localCaps = useLocalCaps();

  const cap = localCaps.find((cap) => cap.id === id);

  const handleSubmit = (success: boolean, capId?: string) => {
    if (success) {
      navigate('/cap-studio');
    }
  };

  const handleCancel = () => {
    navigate('/cap-studio');
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
      <SubmitForm cap={cap} onSubmit={handleSubmit} onCancel={handleCancel} />
    </DashboardLayout>
  );
}

import { useNavigate, useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardLayout } from '../layout/dashboard-layout';
import { CapEditForm } from './cap-edit-form';

export function CapEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const localCaps = useLocalCaps();

  const editingCap = id ? localCaps.find((cap) => cap.id === id) : undefined;

  const handleSave = () => {
    navigate('/cap-studio');
  };

  const handleCancel = () => {
    navigate('/cap-studio');
  };

  return (
    <DashboardLayout>
      <CapEditForm
        editingCap={editingCap}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}

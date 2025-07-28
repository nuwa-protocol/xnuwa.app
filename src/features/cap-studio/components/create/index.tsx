import { useNavigate, useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardLayout } from '../layout/dashboard-layout';
import { CapBuilder } from './cap-builder';

export function Create() {
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
      <CapBuilder
        editingCap={editingCap}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  );
}

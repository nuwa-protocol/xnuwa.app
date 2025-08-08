import { useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardLayout } from '../layout/dashboard-layout';
import { CapEditForm } from './cap-edit-form';

export function CapEdit() {
  const { id } = useParams();
  const localCaps = useLocalCaps();

  const editingCap = id ? localCaps.find((cap) => cap.id === id) : undefined;

  return (
    <DashboardLayout>
      <CapEditForm editingCap={editingCap} />
    </DashboardLayout>
  );
}

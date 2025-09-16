import { useParams } from 'react-router-dom';
import { CapStudioStore } from '../../stores';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { CapSubmitForm } from './cap-submit-form';

export function Submit() {
  const { id } = useParams();
  const { localCaps } = CapStudioStore();

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

  return (
    <DashboardLayout>
      <CapSubmitForm cap={cap} />
    </DashboardLayout>
  );
}

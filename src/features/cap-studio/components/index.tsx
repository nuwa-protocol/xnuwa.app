import { useNavigate } from 'react-router-dom';
import type { LocalCap } from '../types';
import { DashboardHeader, DashboardLayout } from './layout/dashboard-layout';
import { MyCapsGallery } from './my-caps';

export function CapStudio() {
  const navigate = useNavigate();

  const handleEditCap = (cap: LocalCap) => {
    navigate(`/cap-studio/edit/${cap.id}`);
  };

  const handleTestCap = (cap: LocalCap) => {
    navigate(`/cap-studio/mcp/${cap.id}`);
  };

  const handleSubmitCap = (cap: LocalCap) => {
    navigate(`/cap-studio/submit/${cap.id}`);
  };

  const handleCreateNew = () => {
    navigate('/cap-studio/create');
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Cap Studio"
        description="Create, test, and publish powerful AI capabilities with integrated MCP tools"
      />

      <MyCapsGallery
        onEditCap={handleEditCap}
        onTestCap={handleTestCap}
        onSubmitCap={handleSubmitCap}
        onCreateNew={handleCreateNew}
      />
    </DashboardLayout>
  );
}

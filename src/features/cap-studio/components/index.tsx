import { Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { LocalCap } from '../types';
import { DashboardHeader, DashboardLayout } from './layout/dashboard-layout';
import { MyCaps } from './my-caps';

export function CapStudio() {
  const navigate = useNavigate();
  const { setCurrentCap } = CurrentCapStore();

  const handleEditCap = (cap: LocalCap) => {
    navigate(`/cap-studio/edit/${cap.id}`);
  };

  const handleTestCap = (cap: LocalCap) => {
    // Set this cap as the current cap for testing
    setCurrentCap(cap);
    navigate(`/chat`);
  };

  const handleSubmitCap = (cap: LocalCap) => {
    navigate(`/cap-studio/submit/${cap.id}`);
  };

  const handleCreateNew = () => {
    navigate('/cap-studio/create');
  };

  const handleGoToMcp = () => {
    navigate('/cap-studio/mcp');
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Agent Studio"
        description="Create, test, and publish powerful AI agents with integrated MCP tools"
        actions={
          <Button onClick={handleGoToMcp} variant="outline" size="sm">
            <Bug className="mr-1" /> MCP Debug Tool
          </Button>
        }
      />

      <MyCaps
        onEditCap={handleEditCap}
        onTestCap={handleTestCap}
        onSubmitCap={handleSubmitCap}
        onCreateNew={handleCreateNew}
      />
    </DashboardLayout>
  );
}

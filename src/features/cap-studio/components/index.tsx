import { Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { useCurrentCap } from '@/shared/hooks';
import type { LocalCap } from '../types';
import { BatchCreate } from './batch-create';
import { DashboardHeader, DashboardLayout } from './layout/dashboard-layout';
import { MyCaps } from './my-caps';

export function CapStudio() {
  const navigate = useNavigate();
  const { setCurrentCap } = useCurrentCap();

  const handleEditCap = (cap: LocalCap) => {
    navigate(`/cap-studio/edit/${cap.id}`);
  };

  const handleTestCap = (cap: LocalCap) => {
    // Set this cap as the current cap for testing
    setCurrentCap(cap.capData);
    navigate(`/chat`);
  };

  const handleSubmitCap = (cap: LocalCap) => {
    navigate(`/cap-studio/submit/${cap.id}`);
  };

  const handleCreateNew = () => {
    navigate('/cap-studio/create');
  };

  const handleGoToMcpServer = () => {
    navigate('/cap-studio/mcp-server');
  };

  const handleGoToMcpUI = () => {
    navigate('/cap-studio/mcp-ui');
  };

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Cap Studio"
        description="Create, test, and publish powerful AI capabilities with integrated MCP tools"
        actions={
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoToMcpServer} variant="outline" size="sm">
              <Bug className="mr-1" /> MCP Server Debug
            </Button>
            <Button onClick={handleGoToMcpUI} variant="outline" size="sm">
              <Bug className="mr-1" /> MCP UI Debug
            </Button>
          </div>
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

export { BatchCreate };

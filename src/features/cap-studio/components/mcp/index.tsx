import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../layout/dashboard-layout';
import { Mcp } from './mcp';

export function MCPDebug() {
  const [searchParams] = useSearchParams();
  const mcpServerUrl = searchParams.get('mcpserver');
  const mcpUIUrl = searchParams.get('mcpui');

  return (
    <DashboardLayout className="max-w-full">
      <Mcp mcpServerUrl={mcpServerUrl} mcpUIUrl={mcpUIUrl} />
    </DashboardLayout>
  );
}

import { useParams, useSearchParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { Mcp } from './mcp';

export function McpTools() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const localCaps = useLocalCaps();

  const cap = id ? localCaps.find((cap) => cap.id === id) : null;
  const serverName = searchParams.get('server');

  if (id && !cap) {
    return (
      <DashboardLayout>
        <DashboardHeader
          title="Cap Not Found"
          description="The cap you're trying to debug could not be found"
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cap not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Mcp cap={cap} serverName={serverName} />
    </DashboardLayout>
  );
}

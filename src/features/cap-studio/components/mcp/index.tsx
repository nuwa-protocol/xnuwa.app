import { useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { McpToolsSection } from './mcp-tools-section';

export function Mcp() {
  const { id } = useParams();
  const localCaps = useLocalCaps();

  const cap = id ? localCaps.find((cap) => cap.id === id) : null;

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
      <McpToolsSection />
    </DashboardLayout>
  );
}

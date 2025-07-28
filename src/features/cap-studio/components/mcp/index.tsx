import { useParams } from 'react-router-dom';
import { useLocalCaps } from '../../hooks';
import { DashboardHeader, DashboardLayout } from '../layout/dashboard-layout';
import { McpToolsSection } from './mcp-tools-section';

export function Mcp() {
  const { id } = useParams();
  const localCaps = useLocalCaps();

  const cap = localCaps.find((cap) => cap.id === id);

  if (!cap) {
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
      <DashboardHeader
        title="MCP Tools Debug"
        description={`Debug and test MCP tools for "${cap.name}"`}
      />

      <McpToolsSection />
    </DashboardLayout>
  );
}

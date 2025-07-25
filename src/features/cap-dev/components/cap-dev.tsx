import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';

import McpDebugPanel from './mcp-debug-panel';

export function CapDev() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Cap Development</h1>
        <p className="text-muted-foreground">
          Debug and test capabilities and MCP tools
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>MCP Tools</CardTitle>
            <CardDescription>
              Test and debug Model Context Protocol connections and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <McpDebugPanel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cap Tools</CardTitle>
            <CardDescription>
              Debug and test capability tools and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cap debugging tools coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

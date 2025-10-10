import { useSearchParams } from 'react-router-dom';
import { Mcp } from './mcp';

export function MCPDebug() {
  const [searchParams] = useSearchParams();
  const mcpServerUrl = searchParams.get('mcpserver');
  const mcpUIUrl = searchParams.get('mcpui');

  return (
    <div className="max-w-full overflow-y-auto p-0">
      <Mcp mcpServerUrl={mcpServerUrl} mcpUIUrl={mcpUIUrl} />
    </div>
  );
}

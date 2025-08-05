import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui';
import type { LocalCap } from '../../types';

interface CapInformationProps {
  cap: LocalCap;
}

export function CapInformation({ cap }: CapInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cap Information</CardTitle>
        <CardDescription>
          Basic information about your cap (read-only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Name
            </div>
            <p className="text-sm">{cap.capData.idName}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Display Name
            </div>
            <p className="text-sm">{cap.capData.metadata.displayName}</p>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            Description
          </div>
          <p className="text-sm">{cap.capData.metadata.description}</p>
        </div>
        <div>
          <div className="text-sm font-medium text-muted-foreground">Tags</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {cap.capData.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Model
            </div>
            <p className="text-sm">{cap.capData.core.model.name}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              MCP Servers
            </div>
            <p className="text-sm">
              {Object.keys(cap.capData.core.mcpServers).length > 0
                ? Object.keys(cap.capData.core.mcpServers).join(', ')
                : 'None'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

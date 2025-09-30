import { Copy, Cpu, FileCode, Palette, Server } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import type { Cap } from '@/shared/types';

interface CapDetailsConfigurationProps {
  downloadedCapData: Cap;
}

export function CapDetailsConfiguration({
  downloadedCapData,
}: CapDetailsConfigurationProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          Configuration
        </CardTitle>
        <CardAction>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const val =
                typeof downloadedCapData.core.prompt === 'string'
                  ? downloadedCapData.core.prompt
                  : downloadedCapData.core.prompt?.value || '';
              if (val) {
                navigator.clipboard.writeText(val);
                toast.success('Prompt copied to clipboard');
              } else {
                toast('No prompt text to copy');
              }
            }}
          >
            Copy Prompt
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="prompt" className="gap-2">
              <FileCode className="h-4 w-4" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="model" className="gap-2">
              <Cpu className="h-4 w-4" />
              Model
            </TabsTrigger>
            <TabsTrigger value="mcp" className="gap-2">
              <Server className="h-4 w-4" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="artifact" className="gap-2">
              <Palette className="h-4 w-4" />
              Artifact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="relative mt-0">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2 absolute bottom-0 right-2"
              onClick={() => {
                const val =
                  typeof downloadedCapData.core.prompt === 'string'
                    ? downloadedCapData.core.prompt
                    : downloadedCapData.core.prompt?.value || '';
                if (val) {
                  navigator.clipboard.writeText(val);
                  toast.success('Prompt copied to clipboard');
                } else {
                  toast('No prompt text to copy');
                }
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto border">
              <pre className="text-muted-foreground whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {typeof downloadedCapData.core.prompt === 'string'
                  ? downloadedCapData.core.prompt
                  : downloadedCapData.core.prompt.value ||
                  'No prompt configured.'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="model" className="mt-0">
            <div className="space-y-4">
              {downloadedCapData.core.model ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Model ID
                    </p>
                    <p className="font-medium text-sm break-all">
                      {downloadedCapData.core.model.modelId}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">
                      LLM Gateway
                    </p>
                    <p className="font-medium text-sm break-all">
                      {downloadedCapData.core.model.customGatewayUrl ||
                        'Nuwa LLM Gateway'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Cpu className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No model configuration available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mcp" className="mt-0">
            <div className="space-y-3">
              {downloadedCapData.core.mcpServers &&
                Object.keys(downloadedCapData.core.mcpServers).length > 0 ? (
                <div className="grid gap-3">
                  {Object.entries(downloadedCapData.core.mcpServers).map(
                    ([name, server]: [string, any]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{name}</span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {typeof server === 'string'
                            ? server
                            : server.command || 'Custom Config'}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No MCP servers configured</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="artifact" className="mt-0">
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">
                    Artifact URL
                  </p>
                  <p className="font-medium text-sm break-all">
                    {downloadedCapData.core.artifact?.srcUrl ||
                      'No artifact URL configured'}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import { Check, Code, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';

import type { McpServerConfig } from '../../types';

interface McpServersConfigProps {
  mcpServers: Record<string, McpServerConfig>;
  onUpdateMcpServers: (servers: Record<string, McpServerConfig>) => void;
  capId?: string;
}

export function McpServersConfig({
  mcpServers,
  onUpdateMcpServers,
  capId,
}: McpServersConfigProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [newServer, setNewServer] = useState<McpServerConfig>({
    name: '',
    url: '',
    transport: 'sse',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
  }>({});

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Server name is required';
    }
    if (!/^[a-z-]+$/.test(name)) {
      return 'Name must contain only lowercase letters and dashes';
    }
    if (mcpServers[name]) {
      return 'Server name already exists';
    }
    return undefined;
  };

  const validateUrl = (url: string): string | undefined => {
    if (!url.trim()) {
      return 'Server URL is required';
    }
    try {
      new URL(url);
      return undefined;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const handleAddServer = () => {
    setIsAdding(true);
    setNewServer({
      name: '',
      url: '',
      transport: 'sse',
    });
    setErrors({});
  };

  const handleConfirmServer = () => {
    const nameError = validateName(newServer.name);
    const urlError = validateUrl(newServer.url);

    setErrors({
      name: nameError,
      url: urlError,
    });

    if (nameError || urlError) {
      return;
    }

    const updatedServers = {
      ...mcpServers,
      [newServer.name]: {
        name: newServer.name,
        url: newServer.url,
        transport: newServer.transport,
      },
    };

    onUpdateMcpServers(updatedServers);
    setIsAdding(false);
    setNewServer({
      name: '',
      url: '',
      transport: 'sse',
    });
    setErrors({});
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewServer({
      name: '',
      url: '',
      transport: 'sse',
    });
    setErrors({});
  };

  const handleRemoveServer = (serverName: string) => {
    const { [serverName]: removed, ...rest } = mcpServers;
    onUpdateMcpServers(rest);
  };

  const handleTestServer = (serverName: string) => {
    if (capId) {
      navigate(
        `/cap-studio/mcp/${capId}?server=${encodeURIComponent(serverName)}`,
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">MCP Servers</CardTitle>
            <CardDescription>
              Only SSE and HTTP Streamable transports are supported.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddServer}
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing MCP servers */}
          {Object.entries(mcpServers).map(([serverName, config]) => (
            <div
              key={serverName}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">
                  {config.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {config.transport.toUpperCase()} • {config.url}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {capId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestServer(serverName)}
                  >
                    <Code />
                    Debug
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveServer(serverName)}
                  title="Remove Server"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add new server form */}
          {isAdding && (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-name">Server Name</Label>
                    <Input
                      placeholder="Enter server name"
                      value={newServer.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewServer((prev) => ({
                          ...prev,
                          name: value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          name: validateName(value),
                        }));
                      }}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="server-url">Server URL</Label>
                    <Input
                      placeholder="Enter server URL (e.g., https://example.com/sse)"
                      value={newServer.url}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewServer((prev) => ({
                          ...prev,
                          url: value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          url: validateUrl(value),
                        }));
                      }}
                      className={errors.url ? 'border-red-500' : ''}
                    />
                    {errors.url && (
                      <p className="text-xs text-red-500">{errors.url}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transport">Transport</Label>
                    <Select
                      value={newServer.transport}
                      onValueChange={(value: 'sse' | 'http-stream') =>
                        setNewServer((prev) => ({
                          ...prev,
                          transport: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="sse">SSE</SelectItem>
                        <SelectItem value="http-streamable">
                          HTTP Streamable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAdd}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleConfirmServer}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(mcpServers).length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No MCP servers configured</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Check, Code, Edit, Plus, X } from 'lucide-react';
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
} from '@/shared/components/ui';

import type { CapMcpServer } from '@/shared/types/cap-new';

interface McpServersConfigProps {
  mcpServers: Record<string, CapMcpServer>;
  onUpdateMcpServers: (servers: Record<string, CapMcpServer>) => void;
}

export function McpServersConfig({
  mcpServers,
  onUpdateMcpServers,
}: McpServersConfigProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const [newServer, setNewServer] = useState<{
    name: string;
    url: string;
  }>({
    name: '',
    url: '',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    url?: string;
  }>({});

  const validateName = (
    name: string,
    originalName?: string,
  ): string | undefined => {
    if (!name.trim()) {
      return 'Server name is required';
    }
    if (!/^[a-z-]+$/.test(name)) {
      return 'Name must contain only lowercase letters and dashes';
    }
    if (mcpServers[name] && name !== originalName) {
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
    setEditingServer(null);
    setNewServer({
      name: '',
      url: '',
    });
    setErrors({});
  };

  const handleEditServer = (serverName: string) => {
    const serverUrl = mcpServers[serverName];
    setEditingServer(serverName);
    setIsAdding(false);
    setNewServer({
      name: serverName,
      url: serverUrl,
    });
    setErrors({});
  };

  const handleConfirmServer = () => {
    const nameError = validateName(newServer.name, editingServer || undefined);
    const urlError = validateUrl(newServer.url);

    setErrors({
      name: nameError,
      url: urlError,
    });

    if (nameError || urlError) {
      return;
    }

    let updatedServers = { ...mcpServers };

    if (editingServer && editingServer !== newServer.name) {
      // Remove the old server entry if name changed
      const { [editingServer]: removed, ...rest } = updatedServers;
      updatedServers = rest;
    }

    // Add/update the server with the new/current name
    updatedServers[newServer.name] = newServer.url;

    onUpdateMcpServers(updatedServers);
    setIsAdding(false);
    setEditingServer(null);
    setNewServer({
      name: '',
      url: '',
    });
    setErrors({});
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditingServer(null);
    setNewServer({
      name: '',
      url: '',
    });
    setErrors({});
  };

  const handleRemoveServer = (serverName: string) => {
    const { [serverName]: removed, ...rest } = mcpServers;
    onUpdateMcpServers(rest);
  };

  const handleTestServer = (serverUrl: string) => {
    navigate(`/cap-studio/mcp?mcpserver=${encodeURIComponent(serverUrl)}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Remote MCP</CardTitle>
            <CardDescription>
              Set up Remote MCP servers to provide tools for your Cap.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddServer}
            disabled={isAdding || editingServer !== null}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Existing Remote MCP servers */}
          {Object.entries(mcpServers).map(([serverName, url]) => (
            <div
              key={serverName}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{serverName}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {url}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditServer(serverName)}
                  disabled={isAdding || editingServer !== null}
                  title="Edit Server"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestServer(url)}
                  disabled={isAdding || editingServer !== null}
                >
                  <Code className="h-4 w-4" />
                  Debug
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveServer(serverName)}
                  disabled={isAdding || editingServer !== null}
                  title="Remove Server"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add/Edit server form */}
          {(isAdding || editingServer) && (
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
                          name: validateName(value, editingServer || undefined),
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
                      {editingServer ? 'Update' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(mcpServers).length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No Remote MCP servers configured</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

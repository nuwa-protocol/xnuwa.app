import { Archive, Copy, Download, FileText, MoreHorizontal, Share } from 'lucide-react';
import { useState } from 'react';
import type { InstalledCap } from '@/features/cap-store/types';
import { toast } from '@/shared/components';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FormLabel,
  Textarea,
} from '@/shared/components/ui';

interface CapActionsProps {
  cap: InstalledCap;
  onEdit?: () => void;
  onDebug?: () => void;
  onSubmit?: () => void;
}

export function CapActions({
  cap,
  onEdit,
  onDebug,
  onSubmit,
}: CapActionsProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml'>('json');

  const handleExport = async () => {
    try {
      const exportData = {
        name: cap.name,
        description: cap.description,
        tag: cap.tag,
        version: cap.version,
        prompt: cap.prompt,
        model: cap.model,
        mcpServers: cap.mcpServers,
      };

      let content: string;
      let filename: string;

      if (exportFormat === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `${cap.name.replace(/\s+/g, '-').toLowerCase()}.cap.json`;
      } else {
        // Simple YAML export (could use a proper YAML library)
        content = `name: ${cap.name}
description: ${cap.description}
tag: ${cap.tag}
version: ${cap.version}
prompt: |
  ${cap.prompt
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')}
model:
  name: ${cap.model.name}
  provider: ${cap.model.providerName}
mcpServers:
${Object.entries(cap.mcpServers)
  .map(
    ([name, config]) =>
      `  ${name}:
    url: ${config.url}`,
  )
  .join('\n')}`;
        filename = `${cap.name.replace(/\s+/g, '-').toLowerCase()}.cap.yaml`;
      }

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        type: 'success',
        description: `Downloaded as ${filename}`,
      });

      setShowExportDialog(false);
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to export cap. Please try again.',
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const exportData = {
        name: cap.name,
        description: cap.description,
        tag: cap.tag,
        version: cap.version,
        prompt: cap.prompt,
        model: cap.model,
        mcpServers: cap.mcpServers,
      };

      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      toast({
        type: 'success',
        description: 'Cap configuration copied as JSON',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to copy to clipboard',
      });
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/caps/${cap.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        type: 'success',
        description: 'Cap share link copied to clipboard',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to generate share link',
      });
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button onClick={onEdit} size="sm" variant="outline">
          Edit
        </Button>
        <Button onClick={onDebug} size="sm" variant="outline">
          Debug
        </Button>
        <Button onClick={onSubmit} size="sm">
          Submit
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Cap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Configuration
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share Cap
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Archive className="h-4 w-4 mr-2" />
              Archive Cap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Cap</DialogTitle>
            <DialogDescription>
              Choose the format to export your cap configuration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                onClick={() => setExportFormat('json')}
              >
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant={exportFormat === 'yaml' ? 'default' : 'outline'}
                onClick={() => setExportFormat('yaml')}
              >
                <FileText className="h-4 w-4 mr-2" />
                YAML
              </Button>
            </div>

            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Preview:</FormLabel>
              <Textarea
                readOnly
                value={
                  exportFormat === 'json'
                    ? JSON.stringify(
                        {
                          name: cap.name,
                          description: cap.description,
                          tag: cap.tag,
                          version: cap.version,
                        },
                        null,
                        2,
                      )
                    : `name: ${cap.name}\ndescription: ${cap.description}\ntag: ${cap.tag}\nversion: ${cap.version}`
                }
                className="font-mono text-xs"
                rows={8}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

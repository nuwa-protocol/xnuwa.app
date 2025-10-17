import { Loader2 } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { parseYaml } from '@/features/cap-studio/utils/yaml';
import { Button, Input } from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { toLiveWebSocketUrl } from '@/shared/utils/live-source-url';

interface LiveDebugCapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  onUrlChange: (value: string) => void;
  expectedIdName: string;
  onSubmit: () => void | Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function LiveDebugCapDialog({
  open,
  onOpenChange,
  url,
  onUrlChange,
  expectedIdName,
  onSubmit,
  onCancel,
  isSubmitting,
}: LiveDebugCapDialogProps) {
  const liveYamlInputId = useId();
  const derivedWsUrl = toLiveWebSocketUrl(url);
  const [isValidating, setIsValidating] = useState(false);

  const handleConfirm = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      toast.error('Please enter a valid source URL.');
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch(trimmedUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch cap YAML from the provided URL (status ${response.status}).`,
        );
      }

      const text = await response.text();
      const data = parseYaml<Record<string, unknown>>(text);
      const fetchedIdName =
        data && typeof data === 'object'
          ? (data as Record<string, unknown>).idName
          : undefined;

      if (
        typeof fetchedIdName !== 'string' ||
        fetchedIdName.trim().length === 0
      ) {
        toast.error('The fetched cap YAML is missing an idName field.');
        return;
      }

      if (fetchedIdName !== expectedIdName) {
        toast.error(
          `The fetched cap idName "${fetchedIdName}" does not match the selected cap "@${expectedIdName}".`,
        );
        return;
      }

      await onSubmit();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to validate the cap YAML from the provided URL.';
      toast.error(
        'Failed to start live debugging. Please check the URL and try again.',
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start Live Debugging</DialogTitle>
          <DialogDescription>
            Start live debugging for a Cap from a local Cap YAML file. Enter the
            served URL to auto-refresh the cap while you edit the YAML file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor={liveYamlInputId}>Cap YAML URL</Label>
            <Input
              id={liveYamlInputId}
              placeholder="http://localhost:8080/"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {derivedWsUrl ? (
                <>
                  We will auto-connect to{' '}
                  <code className="mx-1 text-foreground">{derivedWsUrl}</code>{' '}
                  for live updates.
                </>
              ) : (
                'Enter a valid HTTP URL to generate the WebSocket endpoint automatically.'
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || isValidating}
          >
            {(isSubmitting || isValidating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Start
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

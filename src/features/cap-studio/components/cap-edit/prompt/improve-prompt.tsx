import { Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { toast } from 'sonner';
import { improvePrompt as improvePromptService } from '@/features/cap-studio/services/improve-prompt';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/components/ui';

interface ImprovePromptProps {
  // Current prompt content
  prompt: string;
  // Apply the improved prompt to the editor
  onApply: (improved: string) => void;
}

// A small toolbar button that calls the Improve Prompt service
// and replaces the current prompt with the improved version.
export function ImprovePrompt({ prompt, onApply }: ImprovePromptProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [lastBefore, setLastBefore] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'diff'>('preview');

  const hasPreview = useMemo(() => preview.trim().length > 0, [preview]);

  const generatePreview = async () => {
    const input = prompt?.trim() || '';
    if (!input) {
      toast('Write something first');
      return;
    }

    try {
      setIsLoading(true);
      const improved = await improvePromptService({ prompt: input });
      if (improved && typeof improved === 'string') {
        setPreview(improved);
        setDialogOpen(true); // Open only after generation completes
      } else {
        setPreview('');
        toast('No improvements returned');
      }
    } catch (err) {
      console.error('Failed to improve prompt:', err);
      toast.error('Failed to improve prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!hasPreview) return;
    setLastBefore(prompt);
    onApply(preview);
    setDialogOpen(false);
    toast.success('Prompt improved');
  };

  const handleCopy = async () => {
    if (!hasPreview) return;
    try {
      await navigator.clipboard.writeText(preview);
      toast.success('Copied improved prompt');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleUndo = () => {
    if (lastBefore == null) return;
    onApply(lastBefore);
    setLastBefore(null);
    toast.success('Restored previous prompt');
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={generatePreview}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Prompt AI
        </Button>
        {lastBefore !== null && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleUndo}
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Improve Prompt</DialogTitle>
          </DialogHeader>

          <DiffOrPreview
            original={prompt}
            improved={preview}
            activeTab={activeTab}
            onTabChange={(v) => setActiveTab(v as 'preview' | 'diff')}
            onPreviewChange={setPreview}
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!hasPreview}
            >
              Copy
            </Button>
            <Button onClick={handleAccept} disabled={!hasPreview}>
              Accept & Replace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DiffOrPreview({
  original,
  improved,
  activeTab,
  onTabChange,
  onPreviewChange,
}: {
  original: string;
  improved: string;
  activeTab: 'preview' | 'diff';
  onTabChange: (v: string) => void;
  onPreviewChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="diff">Diff</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <div className="space-y-2">
            <Label>Preview</Label>
            <Textarea
              value={improved}
              onChange={(e) => onPreviewChange(e.target.value)}
              placeholder="Preview will appear here..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>
        </TabsContent>
        <TabsContent value="diff">
          <div className="rounded-md border h-[420px] overflow-auto">
            <ReactDiffViewer
              oldValue={original || ''}
              newValue={improved || ''}
              compareMethod={DiffMethod.WORDS}
              splitView
              hideLineNumbers={false}
              showDiffOnly={false}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

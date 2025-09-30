import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components';
import { Input, Label } from '@/shared/components/ui';
import type { CapArtifact } from '@/shared/types';
import { validateURL } from '@/shared/utils/validate-url';

interface ArtifactEditorProps {
  value: CapArtifact;
  onChange: (value: CapArtifact) => void;
}

export function ArtifactEditor({ value, onChange }: ArtifactEditorProps) {
  const [testStatus, setTestStatus] = useState<
    'idle' | 'testing' | 'passed' | 'failed'
  >('idle');
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const debounceRef = useRef<number | null>(null);

  // TODO: artifact url test need to be more strict
  // Automatically validate the URL when it changes, with a small debounce.
  useEffect(() => {
    // Clear any pending debounce when URL changes
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const url = value.srcUrl?.trim();

    if (!url) {
      // Nothing to validate
      setTestStatus('idle');
      setErrorMsg(undefined);
      return;
    }

    // Start testing after a short debounce to avoid firing on every keystroke
    setTestStatus('testing');
    setErrorMsg(undefined);

    debounceRef.current = window.setTimeout(async () => {
      try {
        const result = await validateURL(url);
        // Only update if the value hasn't changed during the async call
        if (value.srcUrl?.trim() !== url) return;

        if (result.isValid) {
          setTestStatus('passed');
          setErrorMsg(undefined);
        } else {
          setTestStatus('failed');
          setErrorMsg(result.error || 'The artifact URL cannot be reached.');
        }
      } catch (e) {
        // Only update if the value hasn't changed
        if (value.srcUrl?.trim() !== url) return;
        setTestStatus('failed');
        setErrorMsg('The artifact URL cannot be reached.');
      }
    }, 600);

    // Cleanup on unmount or URL change
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [value.srcUrl]);

  const srcId = useId();

  return (
    <div className="space-y-6">
      {/* Source URL */}
      <div className="space-y-2">
        <Label htmlFor={srcId}>Artifact Source URL</Label>
        <div className="flex items-center gap-2">
          <Input
            id={srcId}
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://your-domain.com/your-artifact.js"
            value={value.srcUrl}
            onChange={(e) => {
              onChange({ ...value, srcUrl: e.target.value });
              // Reset to idle so auto-validation restarts with debounce
              if (testStatus !== 'idle') setTestStatus('idle');
            }}
          />
          {testStatus === 'testing' && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {testStatus === 'passed' && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {testStatus === 'failed' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-destructive cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {errorMsg || 'URL is invalid or unreachable.'}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Must be a valid, reachable URL to your artifact page.
        </p>
      </div>
    </div>
  );
}

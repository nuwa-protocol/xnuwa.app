import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components';
import { Title } from '@/shared/components/title';
import { Button } from '@/shared/components/ui/button';
import type { SaveStatus } from '../../hooks/use-artifact';

export const ArtifactHeader = ({
  title,
  hasConnectionError,
  isProcessingAIRequest,
  saveStatus,
}: {
  title: string;
  hasConnectionError: boolean;
  isProcessingAIRequest: boolean;
  saveStatus: SaveStatus;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id');
  // Show the "Saved" badge briefly, then hide it automatically
  const [showTransientSaved, setShowTransientSaved] = useState(false);

  // When we enter the saved state, show the badge for a short time
  // Hide it while saving again or when AI is processing
  useEffect(() => {
    if (saveStatus === 'saved') {
      setShowTransientSaved(true);
      const t = setTimeout(() => setShowTransientSaved(false), 2000);
      return () => clearTimeout(t);
    }
    if (saveStatus === 'saving' || saveStatus === 'idle') {
      setShowTransientSaved(false);
    }
  }, [saveStatus]);
  const handleClose = () => {
    navigate(`/chat${chatId ? `?chat_id=${chatId}` : ''}`);
  };

  return (
    <div className="sticky top-0 z-10 grid grid-cols-3 items-center border-b border-border bg-background/60 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md hover:bg-destructive/10"
          onClick={handleClose}
          aria-label="Close"
          title="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {/* Center: Title (editable) + Status area (AI or Save) */}
      <div className="flex flex-row justify-center items-center min-w-0 max-w-[min(70vw,700px)]">
        <div className="flex flex-row justify-center items-center gap-2">
          <Title title={title} onCommit={() => { }} />
          {/* Status area shares the same spot: prefer AI processing over save status */}
          {isProcessingAIRequest ? (
            <AIProcessingBadge />
          ) : (
            (() => {
              const shouldShowSaveBadge =
                saveStatus !== 'idle' &&
                (saveStatus !== 'saved' || showTransientSaved);
              return shouldShowSaveBadge ? (
                <SaveStatusBadge status={saveStatus} />
              ) : null;
            })()
          )}
        </div>
      </div>
      {/* Right: Connection status only (AI indicator moved next to title) */}
      <div className="justify-self-end">
        {hasConnectionError && (
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <h3 className="text-destructive font-medium">
                Connection Failed
              </h3>
              <p className="text-muted-foreground max-w-xs">
                Artifact might not respond to AI functions. Please try
                refreshing the page.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

const SaveStatusBadge = ({ status }: { status: SaveStatus }) => {
  if (status === 'saving') {
    return (
      <Badge
        className="gap-1.5 rounded-full text-xs border-0 bg-muted/50 text-muted-foreground/80"
        variant="secondary"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </Badge>
    );
  }
  if (status === 'saved') {
    return (
      <Badge
        className="gap-1.5 rounded-full text-xs border-0 bg-muted/50 text-muted-foreground/80"
        variant="secondary"
      >
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        Saved
      </Badge>
    );
  }
  if (status === 'error') {
    return (
      <Badge className="gap-1.5 rounded-full text-xs" variant="destructive">
        <XCircle className="h-3.5 w-3.5" />
        Save Failed
      </Badge>
    );
  }
  return null;
};

// Subtle, clearer processing badge UI that matches badge visuals
const AIProcessingBadge = () => {
  return (
    <Badge
      variant="outline"
      className="relative gap-1.5 rounded-full text-xs border-theme-primary/40 text-theme-primary pr-2 pl-1 animate-pulse"
      aria-live="polite"
      aria-busy="true"
    >
      <Sparkles className="size-4" />
      <span className="font-medium">AI Processing…</span>
    </Badge>
  );
};

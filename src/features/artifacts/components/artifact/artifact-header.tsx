import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components';
import { Title } from '@/shared/components/title';
import { Button } from '@/shared/components/ui/button';

export const ArtifactHeader = ({
  title,
  connectionError,
  processingAIRequest,
}: {
  title: string;
  connectionError: boolean;
  processingAIRequest: boolean;
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('chat_id');
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
      {/* Center: Title (editable) */}
      <div className="flex flex-row justify-center items-center min-w-0 max-w-[min(70vw,700px)]">

        <div className="flex flex-row justify-center items-center gap-2">
          <Title title={title} onCommit={() => { }} />

        </div>
      </div>
      {/* Right: Placeholder to balance center */}
      <div className="justify-self-end">
        {processingAIRequest && (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI Processing</span>
          </div>
        )}
        {connectionError && (
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>
              <h3 className="text-destructive font-medium">
                Connection Failed
              </h3>
              <p className="text-muted-foreground max-w-xs">
                Artifact might not respond to AI functions.
                Please try refreshing the page.
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

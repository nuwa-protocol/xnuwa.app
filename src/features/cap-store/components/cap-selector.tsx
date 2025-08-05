import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import { useCurrentCap } from '@/shared/hooks';
import { CapStoreModal } from './cap-store-modal';

const CapInfo = ({ displayName }: { displayName: string }) => (
  <>
    <Avatar className="size-5">
      <AvatarImage
        src={`https://avatar.vercel.sh/${displayName}`}
        alt={displayName}
      />
      <AvatarFallback className="text-xs">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <span className="text-sm font-normal">{displayName}</span>
  </>
);

export function CapSelector() {
  const {
    currentCap,
    isCurrentCapMCPInitialized,
    isCurrentCapMCPError,
    errorMessage,
  } = useCurrentCap();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <TooltipProvider>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.preventDefault();
          setIsModalOpen(true);
        }}
        className="rounded-xl"
        type="button"
      >
        <div className="flex items-center gap-2">
          <CapInfo displayName={currentCap.metadata.displayName} />
          {!isCurrentCapMCPInitialized && (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          )}
        </div>
      </Button>
      {isCurrentCapMCPError && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <AlertCircle className="w-3 h-3 text-destructive cursor-default" />
          </TooltipTrigger>
          <TooltipContent className="max-w-48 break-words">
            <p>
              {errorMessage ||
                'Cap Initialization Failed, Please Select Again or Check Network Connection'}
            </p>
          </TooltipContent>
        </Tooltip>
      )}

      <CapStoreModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </TooltipProvider>
  );
}

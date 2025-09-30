import { AlertCircle, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CapAvatar } from '@/shared/components/cap-avatar';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useCapStore } from '../stores';
import type { RemoteCap } from '../types';

// TODO: switching cap need to have cache
export function CapSelector() {
  const { currentCap, isInitialized, isError, errorMessage } =
    CurrentCapStore();
  const { favoriteCaps, downloadCapByIDWithCache } = useCapStore();
  const { setCurrentCap } = CurrentCapStore();
  const navigate = useNavigate();
  const handleCapSelect = async (cap: RemoteCap) => {
    const id = cap.id;
    try {
      toast.promise(
        async () => {
          const cap = await downloadCapByIDWithCache(id);
          setCurrentCap(cap);
        },
        {
          loading: 'Loading cap...',
          success: 'Cap is ready to use!',
          error: 'Failed to load cap',
        },
      );
    } catch (error) {
      console.error('Failed to select cap:', error);
    }
  };

  // If no favorite caps, open store directly on click
  if (favoriteCaps.length === 0) {
    return (
      <TooltipProvider>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/explore')}
          className="rounded-lg min-w-0 w-fit"
          type="button"
        >
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className="flex flex-row items-center gap-2 min-w-0 flex-1">
              <CapAvatar
                capName={currentCap.metadata.displayName}
                capThumbnail={currentCap.metadata.thumbnail}
                size="lg"
                className="rounded-md"
              />
              <span className="text-sm font-medium truncate min-w-0">
                {currentCap.metadata.displayName}
              </span>
            </div>
            {!isInitialized && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </Button>
        {isError && (
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
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
        >
          <Button
            variant="ghost"
            className="rounded-lg hover:bg-transparent w-fit min-w-0"
            type="button"
          >
            <div className="flex items-center justify-start gap-2 w-full min-w-0 flex-1">
              <CapAvatar
                capName={currentCap.metadata.displayName}
                capThumbnail={currentCap.metadata.thumbnail}
                size="lg"
                className="rounded-md"
              />
              <span className="text-sm font-medium truncate text-left min-w-0">
                {currentCap.metadata.displayName}
              </span>
              {!isInitialized && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground flex-shrink-0" />
              )}
              <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {favoriteCaps.map((cap) => (
            <DropdownMenuItem
              key={cap.id}
              className="cursor-pointer"
              onSelect={() => handleCapSelect(cap)}
            >
              <div className="flex items-center gap-3">
                <CapAvatar
                  capName={cap.metadata.displayName}
                  capThumbnail={cap.metadata.thumbnail}
                  size="lg"
                  className="rounded-md"
                />
                <span className="text-sm">{cap.metadata.displayName}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => navigate('/explore')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Explore More</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isError && (
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
    </TooltipProvider>
  );
}

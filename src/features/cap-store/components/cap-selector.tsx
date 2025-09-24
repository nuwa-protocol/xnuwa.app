import { AlertCircle, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
import type { Cap } from '@/shared/types';
import { useCapStore } from '../stores';
import type { RemoteCap } from '../types';
import { CapAvatar } from './cap-avatar';

const CapInfo = ({ cap }: { cap: Cap }) => (
  <>
    <CapAvatar
      capName={cap.metadata.displayName}
      capThumbnail={cap.metadata.thumbnail}
      size="sm"
      className="rounded-md"
    />
    <span className="text-sm font-normal">{cap.metadata.displayName}</span>
  </>
);

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
          variant="outline"
          size="sm"
          onClick={() => navigate('/explore')}
          className="rounded-lg"
          type="button"
        >
          <div className="flex items-center gap-2">
            <CapInfo cap={currentCap} />
            {!isInitialized && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
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
            size="sm"
            className="rounded-lg"
            type="button"
          >
            <div className="flex items-center gap-2">
              <CapInfo cap={currentCap} />
              {!isInitialized && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              )}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
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
              <div className="flex items-center gap-2">
                <CapAvatar
                  capName={cap.metadata.displayName}
                  capThumbnail={cap.metadata.thumbnail}
                  size="sm"
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

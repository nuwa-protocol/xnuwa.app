import { AlertCircle, ChevronDown, Loader2, Store } from 'lucide-react';
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
import { capKitService } from '@/shared/services/capkit-service';
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
    />
    <span className="text-sm font-normal">{cap.metadata.displayName}</span>
  </>
);

export function CapSelector() {
  const { currentCap, isInitialized, isError, errorMessage } =
    CurrentCapStore();
  const { favoriteCaps } = useCapStore();
  const { setCurrentCap } = CurrentCapStore();

  const handleCapSelect = async (cap: RemoteCap) => {
    const id = cap.id;
    try {
      const capKit = await capKitService.getCapKit();
      const cap = (await capKit.downloadByID(id));
      setCurrentCap(cap);
    } catch (error) {
      console.error('Failed to select cap:', error);
    }
  };

  const handleOpenStore = (event: React.MouseEvent) => {
    event.preventDefault();
    // openModal();
  };

  // If no favorite caps, open store directly on click
  if (favoriteCaps.length === 0) {
    return (
      <TooltipProvider>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenStore}
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
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
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
                />
                <span className="text-sm">{cap.metadata.displayName}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => console.log('hahah')}
          >
            <Store className="w-4 h-4 mr-2" />
            <span>Browse All</span>
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

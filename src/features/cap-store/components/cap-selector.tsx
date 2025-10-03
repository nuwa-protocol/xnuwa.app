import { AlertCircle, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CapStudioStore } from '@/features/cap-studio/stores/cap-studio-stores';
import type { LocalCap } from '@/features/cap-studio/types';
import { CapAvatar } from '@/shared/components/cap-avatar';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import useDevMode from '@/shared/hooks/use-dev-mode';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import { useCapStore } from '../stores';
import type { RemoteCap } from '../types';
import type { Cap } from '@/shared/types';

// TODO: switching cap need to have cache
export function CapSelector() {
  const { currentCap, isInitialized, isError, errorMessage } =
    CurrentCapStore();
  const { installedCaps } = InstalledCapsStore();
  const { downloadCapByIDWithCache } = useCapStore();
  const { setCurrentCap } = CurrentCapStore();
  const { localCaps } = CapStudioStore();
  const isDevMode = useDevMode();
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

  // Directly switch to a local cap (no download)
  const handleLocalCapSelect = (cap: LocalCap) => {
    try {
      setCurrentCap(cap);
      toast.success('Local cap is ready to use!');
    } catch (error) {
      console.error('Failed to select local cap:', error);
      toast.error('Failed to load local cap');
    }
  };

  // Directly switch to an installed cap (no download)
  const handleInstalledCapSelect = (cap: Cap) => {
    try {
      setCurrentCap(cap);
      toast.success('Cap is ready to use!');
    } catch (error) {
      console.error('Failed to select installed cap:', error);
      toast.error('Failed to load cap');
    }
  };


  // Only show local caps in the selector when dev mode is enabled
  const localCapsToShow = isDevMode ? localCaps : [];
  const hasAnyCaps = installedCaps.length + localCapsToShow.length > 0;

  // Determine if current cap is one of local caps (to show badge in trigger)

  const isCurrentLocal = currentCap && 'capData' in currentCap;

  const capName = currentCap && ('capData' in currentCap ? currentCap.capData.metadata.displayName : currentCap.metadata.displayName);
  const capThumbnail = currentCap && ('capData' in currentCap ? currentCap.capData.metadata.thumbnail : currentCap.metadata.thumbnail);


  // If no favorite caps, open store directly on click
  if (!hasAnyCaps && currentCap) {
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
                cap={currentCap}
                size="lg"
                className="rounded-md"
              />
              <span className="text-sm font-medium truncate min-w-0">
                {capName}
              </span>
              {isCurrentLocal && (
                <Badge variant="secondary" className="ml-1">
                  Dev
                </Badge>
              )}
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
                cap={currentCap}
                size="lg"
                className="rounded-md"
              />
              <span className="text-sm font-medium truncate text-left min-w-0">
                {capName || ''}
              </span>
              {isCurrentLocal && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Dev
                </Badge>
              )}
              {!isInitialized && (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground flex-shrink-0" />
              )}
              <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {localCapsToShow.length > 0 && (
            <>
              <DropdownMenuLabel>Cap Studio</DropdownMenuLabel>
              {localCapsToShow.map((cap) => (
                <DropdownMenuItem
                  key={cap.id}
                  className="cursor-pointer"
                  onSelect={() => handleLocalCapSelect(cap)}
                >
                  <div className="flex items-center gap-3 justify-between w-full">
                    <div className="flex flex-row items-center gap-2">
                      <CapAvatar
                        cap={cap}
                        size="lg"
                        className="rounded-md"
                      />
                      <span className="text-sm">
                        {cap.capData.metadata.displayName}
                      </span>
                    </div>
                    <Badge variant="secondary" className="ml-1">
                      Dev
                    </Badge>
                  </div>
                </DropdownMenuItem>
              ))}
          {installedCaps.length > 0 && <DropdownMenuSeparator />}
            </>
          )}
          <DropdownMenuLabel>Installed Caps</DropdownMenuLabel>
          {installedCaps.map((cap) => (
            <DropdownMenuItem
              key={cap.id}
              className="cursor-pointer"
              onSelect={() => handleInstalledCapSelect(cap)}
            >
              <div className="flex items-center gap-3">
                <CapAvatar
                  cap={cap}
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

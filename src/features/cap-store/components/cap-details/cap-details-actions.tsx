import { Heart, Play } from 'lucide-react';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';

interface CapDetailsActionsProps {
  isLoading: boolean;
  isCapFavorite: boolean;
  isTogglingFavorite: boolean;
  onRunCap: () => void;
  onToggleFavorite: () => void;
  orientation?: 'horizontal' | 'vertical';
}

export function CapDetailsActions({
  isLoading,
  isCapFavorite,
  isTogglingFavorite,
  onRunCap,
  onToggleFavorite,
  orientation = 'horizontal',
}: CapDetailsActionsProps) {
  const isVertical = orientation === 'vertical';
  return (
    <TooltipProvider>
      <div className={`flex gap-3 ${isVertical ? 'flex-col' : ''}`}>
        <Button
          onClick={onRunCap}
          disabled={isLoading}
          className={`gap-2 ${isVertical ? 'w-full' : ''}`}
          variant="primary"
          aria-label={isLoading ? 'Running cap' : 'Run cap'}
        >
          <Play className="h-4 w-4" />
          {isLoading ? 'Loading...' : 'Run Cap'}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            {isCapFavorite ? (
              <Button
                variant="outline"
                onClick={onToggleFavorite}
                disabled={isTogglingFavorite}
                className={`gap-2 group ${isVertical ? 'w-full' : ''}`}
                aria-pressed
                aria-label="Remove from favorites"
              >
                <Heart className="h-4 w-4 fill-current text-red-500" />
                <span className="group-hover:hidden">Favorited</span>
                <span className="hidden group-hover:inline">
                  {isTogglingFavorite ? 'Removing...' : 'Remove'}
                </span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onToggleFavorite}
                disabled={isTogglingFavorite}
                className={`gap-2 ${isVertical ? 'w-full' : ''}`}
                aria-label="Add to favorites"
              >
                <Heart className="h-4 w-4" />
                {isTogglingFavorite ? 'Adding...' : 'Favorite'}
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            {isCapFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

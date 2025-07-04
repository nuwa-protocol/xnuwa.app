import { Globe } from 'lucide-react';
import type React from 'react';
import { Toggle } from '@/shared/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils';
import { useWebSearch } from '../hooks/use-web-search';

interface WebSearchToggleProps {
  className?: string;
}

export const WebSearchToggle: React.FC<WebSearchToggleProps> = ({
  className = '',
}) => {
  const { webSearchEnabled, toggleWebSearch } = useWebSearch();

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            pressed={webSearchEnabled}
            onPressedChange={toggleWebSearch}
            size="sm"
            className={cn(
              'h-8 w-8 p-0 hover:border-border',
              webSearchEnabled &&
                'bg-primary/10 border-primary/30 text-violet-600 hover:bg-primary/20',
              className,
            )}
          >
            <Globe className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>
          <p>{webSearchEnabled ? 'Disable Web Search' : 'Enable Web Search'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

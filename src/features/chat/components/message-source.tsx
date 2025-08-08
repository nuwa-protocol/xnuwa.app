import { ChevronDownIcon, ChevronUpIcon, LinkIcon } from 'lucide-react';
import { useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { cn } from '@/shared/utils';
import { MessageSourceItem } from './message-source-item';

interface MessageSourceProps {
  sources: Array<{
    id?: string;
    title?: string;
    url?: string;
  }>;
  className?: string;
}

export const MessageSource = ({ sources, className }: MessageSourceProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (sources.length === 0) {
    return null;
  }

  const handleSourceClick = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="group flex items-center gap-2 py-2 px-1 hover:bg-muted/30 transition-all duration-200 rounded-md border border-transparent hover:border-border/50">
          <LinkIcon className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
          <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors font-medium">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </span>
          {isOpen ? (
            <ChevronUpIcon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="w-full">
          <div className="mt-2 space-y-1 w-full">
            {sources.map((source, index) => (
              <MessageSourceItem
                key={`source-${index}-${source.id || 'unknown'}`}
                source={source}
                index={index}
                onSourceClick={handleSourceClick}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

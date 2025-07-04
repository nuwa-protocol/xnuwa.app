'use client';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  Globe,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
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
    <Card className={cn('w-full', className)}>
      <CardContent className="p-0">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-3 w-full p-4 hover:bg-muted/50 transition-colors">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Search Result{sources.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {sources.length} source{sources.length !== 1 ? 's' : ''}
            </Badge>
            {isOpen ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="w-full">
            <div className="border-t w-full">
              <div className="p-2 space-y-1 w-full">
                {sources.map((source, index) => (
                  <MessageSourceItem
                    key={`source-${index}-${source.id || 'unknown'}`}
                    source={source}
                    index={index}
                    onSourceClick={handleSourceClick}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

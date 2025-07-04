'use client';

import { ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils';

interface MessageSourceProps {
    source: {
        id?: string;
        title?: string;
        url?: string;
    };
    className?: string;
}

export const MessageSource = ({ source, className }: MessageSourceProps) => {
    const title = source.title || 'Untitled Source';
    const url = source.url || '';
    const id = source.id || 'unknown';
    const isExternalUrl = url.startsWith('http');

    const handleSourceClick = () => {
        if (isExternalUrl && url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Card
            className={cn(
                "group/source transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20",
                isExternalUrl && url && "cursor-pointer hover:border-l-blue-600",
                className
            )}
            onClick={isExternalUrl && url ? handleSourceClick : undefined}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <FileTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs font-medium">
                                #{id}
                            </Badge>
                            {isExternalUrl && url && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <ExternalLinkIcon className="w-3 h-3 text-muted-foreground group-hover/source:text-blue-600 transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Open in new tab
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        <h4 className="font-medium text-sm text-foreground group-hover/source:text-blue-700 dark:group-hover/source:text-blue-300 transition-colors line-clamp-2">
                            {title}
                        </h4>

                        {url && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 break-all">
                                {url}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 
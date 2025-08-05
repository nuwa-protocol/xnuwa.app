import { CopyIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface InfoCardProps {
  title: string;
  description: string;
  info: string;
  copyLabel?: string;
  copiedLabel: string;
  className?: string;
}

export function InfoCard({
  title,
  description,
  info,
  copyLabel,
  copiedLabel,
  className,
}: InfoCardProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [_, copyToClipboard] = useCopyToClipboard();

  const MAX_INFO_LENGTH = 20;
  const truncatedInfo =
    info.length > MAX_INFO_LENGTH
      ? `${info.slice(0, MAX_INFO_LENGTH)}...`
      : info;

  return (
    <div
      className={cn(
        'flex items-center gap-8 p-6 border rounded-lg bg-background shadow-sm',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold mb-1">{title}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 font-mono"
              onClick={async () => {
                await copyToClipboard(info);
                setCopyState('copied');
                toast.success(copiedLabel || 'Copied!');
                setTimeout(() => setCopyState('idle'), 1200);
              }}
            >
              <CopyIcon size={14} />
              <span>{truncatedInfo}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{info}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
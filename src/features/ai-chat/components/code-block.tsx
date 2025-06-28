'use client';

import { useEffect, useState } from 'react';
import { CopyIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useCopyToClipboard } from 'usehooks-ts';
import { toast } from '@/shared/components/toast';
import { useLocale } from '@/shared/locales/use-locale';
import { useStarryNight } from '../hooks';
import './starry-night.css';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const { t } = useLocale();
  const [_, copyToClipboard] = useCopyToClipboard();
  const { highlight, isLoading } = useStarryNight();
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

  // Extract code as string and language
  const codeString = Array.isArray(children) ? children.join('') : String(children);
  const language = className?.replace('language-', '') || '';

  useEffect(() => {
    if (!inline && !isLoading && codeString.trim()) {
      highlight(codeString, language).then(setHighlightedCode);
    }
  }, [codeString, language, inline, isLoading, highlight]);

  if (!inline) {
    return (
      <div className="not-prose flex flex-col relative group">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-7 w-7 min-w-0 min-h-0 z-10"
                onClick={async () => {
                  if (!codeString) {
                    toast({ type: 'error', description: t('artifact.code.copyCode') });
                    return;
                  }
                  await copyToClipboard(codeString);
                  toast({ type: 'success', description: t('artifact.copied') });
                }}
                tabIndex={0}
                aria-label={t('artifact.code.copyCode')}
              >
                <CopyIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('artifact.code.copyCode')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Language label */}
        {language && (
          <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100/80 dark:bg-zinc-800/80 rounded backdrop-blur-sm z-10">
            {language}
          </div>
        )}

        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-muted`}
        >
          {highlightedCode ? (
            <code
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <code className="whitespace-pre-wrap break-words">{children}</code>
          )}
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}

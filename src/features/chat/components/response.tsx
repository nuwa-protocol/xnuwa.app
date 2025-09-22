import type { ComponentProps, HTMLAttributes } from 'react';
import { memo, useMemo } from 'react';
import { Markdown } from '@/shared/components/markdown';
import { ResponseUI } from './response-ui';

function parseCapUIAttributes(
  text: string,
): { url: string; title?: string } | null {
  // Match ![capui:::title](url) or ![capui:::](url) format
  const match = text.match(/^!\[capui:::(.*)\]\((.+?)\)$/);
  if (!match) return null;

  const title = match[1] || undefined; // Empty string becomes undefined
  const url = match[2];

  if (!url) return null;

  return { url, title };
}

interface ResponseWithUIProps extends HTMLAttributes<HTMLDivElement> {
  children: string;
  allowedImagePrefixes?: ComponentProps<
    typeof Markdown
  >['allowedImagePrefixes'];
  allowedLinkPrefixes?: ComponentProps<typeof Markdown>['allowedLinkPrefixes'];
  defaultOrigin?: ComponentProps<typeof Markdown>['defaultOrigin'];
  parseIncompleteMarkdown?: ComponentProps<
    typeof Markdown
  >['parseIncompleteMarkdown'];
}

export const AssistantResponse = memo(
  ({
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown,
    className,
    ...props
  }: ResponseWithUIProps) => {
    const processedContent = useMemo(() => {
      if (typeof children !== 'string') {
        return [{ type: 'markdown', content: children }];
      }

      const parts: Array<{ type: 'markdown' | 'capui'; content: any }> = [];
      const lines = children.split('\n');
      let currentMarkdown = '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (
          trimmedLine.startsWith('![capui:::') &&
          trimmedLine.includes('](')
        ) {
          // Save any accumulated markdown
          if (currentMarkdown.trim()) {
            parts.push({ type: 'markdown', content: currentMarkdown.trim() });
            currentMarkdown = '';
          }

          // Parse and add CapUI component
          const capuiData = parseCapUIAttributes(trimmedLine);
          if (capuiData) {
            parts.push({ type: 'capui', content: capuiData });
          } else {
            // If parsing failed, treat as regular markdown
            currentMarkdown += `${line}\n`;
          }
        } else {
          currentMarkdown += line + '\n';
        }
      }

      // Add any remaining markdown
      if (currentMarkdown.trim()) {
        parts.push({ type: 'markdown', content: currentMarkdown.trim() });
      }

      return parts;
    }, [children]);

    return (
      <div className={className} {...props}>
        {processedContent.map((part) => {
          if (part.type === 'capui') {
            const data = part.content as { url: string; title?: string };
            return (
              <ResponseUI
                key={data.url}
                srcUrl={data.url}
                title={data.title}
              />
            );
          } else {
            return (
              <Markdown
                key={part.content}
                allowedImagePrefixes={allowedImagePrefixes}
                allowedLinkPrefixes={allowedLinkPrefixes}
                defaultOrigin={defaultOrigin}
                parseIncompleteMarkdown={parseIncompleteMarkdown}
              >
                {part.content}
              </Markdown>
            );
          }
        })}
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

AssistantResponse.displayName = 'AssistantResponse';

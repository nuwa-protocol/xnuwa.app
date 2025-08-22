import MarkdownPreview from '@uiw/react-markdown-preview';
import { memo, useState } from 'react';
import { useTheme } from '@/shared/components/theme-provider';
import './markdown.css';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type React from 'react';
import type { ReactNode } from 'react';
import { getCodeString } from 'rehype-rewrite';
import rehypeSanitize from 'rehype-sanitize';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { Button } from '@/shared/components/ui/button';
import { ImageZoom } from '@/shared/components/ui/shadcn-io/image-zoom';
import { MermaidCode } from './markdown-mermaid';

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  node?: {
    children?: any[];
  };
  [key: string]: any;
}

interface ImageProps {
  src?: string;
  alt?: string;
  title?: string;
  className?: string;
  [key: string]: any;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  title,
  className,
  ...props
}) => {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    console.warn('Image failed to load:', src);
  };

  return (
    <ImageZoom zoomMargin={100}>
      <img
        src={src}
        alt={alt || ''}
        title={title}
        className={`markdown-image ${className || ''}`}
        onError={handleImageError}
        style={{
          cursor: 'pointer',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '4px',
          transition: 'opacity 0.2s ease-in-out',
        }}
        {...props}
      />
    </ImageZoom>
  );
};

const Code: React.FC<CodeProps> = ({
  inline,
  children = [],
  className,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();

  const isMermaid =
    className && /^language-mermaid/.test(className.toLocaleLowerCase());
  // original code component
  const code: string = props.node?.children
    ? getCodeString(props.node.children)
    : Array.isArray(children) && children[0]
      ? String(children[0])
      : '';

  if (isMermaid) {
    return <MermaidCode code={code} className={className} />;
  }

  // For inline code, return simple code element
  if (inline) {
    return <code>{children}</code>;
  }

  // For code blocks, add copy button
  const handleCopy = async () => {
    await copyToClipboard(code);
    setIsCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <code {...props}>{children}</code>
      <Button
        size="sm"
        variant="outline"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
        onClick={handleCopy}
      >
        {isCopied ? (
          <CheckIcon className="h-4 w-4" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const { resolvedTheme } = useTheme();
  const rehypePlugins = [rehypeSanitize];
  return (
    <MarkdownPreview
      source={children}
      className="!bg-transparent markdown-preview-content"
      wrapperElement={{
        'data-color-mode': resolvedTheme as 'light' | 'dark',
      }}
      rehypePlugins={rehypePlugins}
      components={{
        code: Code,
        img: Image,
      }}
    />
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

import MarkdownPreview from '@uiw/react-markdown-preview';
import { memo } from 'react';
import { useTheme } from '@/shared/components/theme-provider';
import './markdown.css';
import React, { ReactNode } from 'react';
import { getCodeString } from 'rehype-rewrite';
import rehypeSanitize from 'rehype-sanitize';
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

const Code: React.FC<CodeProps> = ({
  inline,
  children = [],
  className,
  ...props
}) => {
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
  return <code>{children}</code>;
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
      }}
    />
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

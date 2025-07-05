import MarkdownPreview from '@uiw/react-markdown-preview';
import { memo } from 'react';
import { useTheme } from '@/shared/components/theme-provider';
import './markdown.css';

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const { resolvedTheme } = useTheme();
  return (
    <MarkdownPreview
      source={children}
      className="!bg-transparent markdown-preview-content"
      wrapperElement={{
        'data-color-mode': resolvedTheme as 'light' | 'dark',
      }}
    />
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

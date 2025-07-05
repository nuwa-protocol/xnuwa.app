import { common, createStarryNight } from '@wooorm/starry-night';
import { useCallback, useEffect, useState } from 'react';

// HAST (Hypertext Abstract Syntax Tree) types based on starry-night output
interface TextNode {
  type: 'text';
  value: string;
}

interface ElementNode {
  type: 'element';
  tagName: string;
  properties?: {
    className?: string[];
    [key: string]: any;
  };
  children: Array<TextNode | ElementNode>;
}

interface RootNode {
  type: 'root';
  children: Array<TextNode | ElementNode>;
}

type HASTNode = TextNode | ElementNode | RootNode;

interface UseStarryNightReturn {
  highlight: (code: string, language?: string) => Promise<string | null>;
  isLoading: boolean;
}

export function useStarryNight(): UseStarryNightReturn {
  const [starryNight, setStarryNight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initStarryNight = async () => {
      try {
        // Initialize starry-night with common languages
        const instance = await createStarryNight(common);
        if (mounted) {
          setStarryNight(instance);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to initialize starry-night:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initStarryNight();

    return () => {
      mounted = false;
    };
  }, []);

  const highlight = useCallback(
    async (code: string, language?: string): Promise<string | null> => {
      if (!starryNight || !code.trim()) {
        return null;
      }

      try {
        // Get the correct scope for the language
        let scope: string | undefined;

        if (language) {
          // Try to get scope from flagToScope
          scope = starryNight.flagToScope(language);

          // If that doesn't work, try common scope patterns
          if (!scope) {
            scope = starryNight.flagToScope(`source.${language}`);
          }
        }

        // Default to plain text if no scope found
        if (!scope) {
          scope = 'text.plain';
        }

        const result: RootNode = starryNight.highlight(code, scope);

        // Convert the HAST result to HTML string
        const htmlString = toHtml(result);
        return htmlString;
      } catch (error) {
        console.warn('Failed to highlight code:', error);
        return null;
      }
    },
    [starryNight],
  );

  return { highlight, isLoading };
}

// Helper function to convert HAST to HTML
function toHtml(node: HASTNode): string {
  if (node.type === 'text') {
    return escapeHtml(node.value);
  }

  if (node.type === 'element') {
    const { tagName, properties, children } = node;

    // Build attributes
    let attrs = '';
    if (properties?.className && properties.className.length > 0) {
      attrs += ` class="${properties.className.join(' ')}"`;
    }

    // Process children
    const childrenHtml = children.map((child) => toHtml(child)).join('');

    return `<${tagName}${attrs}>${childrenHtml}</${tagName}>`;
  }

  if (node.type === 'root') {
    return node.children.map((child) => toHtml(child)).join('');
  }

  return '';
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

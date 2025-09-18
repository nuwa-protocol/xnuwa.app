import {
  ClipboardCheck,
  FileText,
  PencilLine,
  TextQuote,
  Wand2,
} from 'lucide-react';
import { useEditor } from 'prosekit/react';
import { InlinePopover } from 'prosekit/react/inline-popover';
import { useEffect, useRef, useState } from 'react';
import { useNuwa } from '@/contexts/NuwaClientContext';
import type { EditorExtension } from './extension';

type AiMenuProps = {
  // Control open state from parent (so the trigger can live elsewhere).
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When the parent inline toolbar closes, we also close the AI popover.
  parentOpen?: boolean;
};

/**
 * Inline AI assistant menu extracted from the inline menu.
 * Responsible for its own open state, streaming lifecycle, and applying results
 * back into the editor selection.
 */
export default function AiMenu({
  open,
  onOpenChange,
  parentOpen = true,
}: AiMenuProps) {
  const editor = useEditor<EditorExtension>();
  const { nuwaClient } = useNuwa();

  // Popover and UX state
  const aiMenuOpen = open;
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const streamAbortRef = useRef<() => void>(() => { });
  // Tone controls removed per UX decision

  // Parent popover closed → close AI popover too
  useEffect(() => {
    if (!parentOpen) {
      // Abort any running stream and reset state
      try {
        streamAbortRef.current?.();
      } catch { }
      setIsStreaming(false);
      setAiError(null);
      onOpenChange(false);
    }
  }, [parentOpen]);

  // Close AI menu should stop any ongoing stream
  useEffect(() => {
    if (!aiMenuOpen) {
      try {
        streamAbortRef.current?.();
      } catch { }
      setIsStreaming(false);
      setAiError(null);
      //
    }
  }, [aiMenuOpen]);

  // Utilities for current selection
  const getSelectedText = () => {
    const { doc, selection } = editor.state;
    if (selection.empty) return '';
    return doc.textBetween(selection.from, selection.to, '\n');
  };

  const replaceSelectionWithText = (text: string) => {
    const { state, view } = editor;
    const { from, to } = state.selection;
    const tr = state.tr.replaceWith(from, to, state.schema.text(text));
    view.dispatch(tr);
    editor.focus();
  };



  // Build a prompt that targets the current selection
  const buildPrompt = (action: string, extra?: string) => {
    const selection = getSelectedText();
    const instruction = extra ? `${action}. ${extra}` : action;
    return [
      'You are a concise writing assistant. Return ONLY the transformed text without commentary, code fences, or backticks.',
      `Task: ${instruction}`,
      'Selection:',
      selection || '(no selection)',
    ].join('\n\n');
  };

  //

  const runAI = async (instruction: string) => {
    setAiError(null);
    setAiResult('');
    setIsStreaming(true);
    const prompt = buildPrompt(instruction, aiPrompt.trim());

    try {
      const stream = nuwaClient.createAIStream({ prompt });
      // expose abort if available
      streamAbortRef.current = () => {
        try {
          stream.abort?.();
        } catch { }
      };
      await stream.execute({
        onChunk: (chunk) => {
          const delta = chunk.content ?? '';
          if (!delta) return;
          setAiResult((prev) => prev + delta);
        },
        onError: (err) => {
          setAiError(String(err ?? 'Unknown AI error'));
          setIsStreaming(false);
          return { content: [], isError: true };
        },
      });
    } catch (err) {
      setAiError(String(err));
    } finally {
      setIsStreaming(false);
    }
  };

  // Suggested actions rendered as a vertical list with descriptions
  const suggestions: Array<{
    key: string;
    label: string;
    description: string;
    instruction: string;
    icon: React.ReactNode;
  }> = [
      {
        key: 'translate',
        label: 'Translate',
        description: 'Translate the selection to clear, natural English.',
        instruction: 'Translate this part to clear, natural English',
        icon: <TextQuote className="size-4 shrink-0" />,
      },
      {
        key: 'improve',
        label: 'Improve Writing',
        description: 'Clarify and tighten the wording without changing meaning.',
        instruction: 'Improve writing for clarity and concision',
        icon: <Wand2 className="size-4 shrink-0" />,
      },
      {
        key: 'formalize',
        label: 'Formalize',
        description: 'Rewrite in a more professional, formal tone.',
        instruction: 'Rewrite in a formal, professional tone',
        icon: <Wand2 className="size-4 shrink-0" />,
      },
      {
        key: 'expand',
        label: 'Expand',
        description: 'Add helpful detail while keeping the original tone.',
        instruction: 'Expand with more detail while keeping the style',
        icon: <PencilLine className="size-4 shrink-0" />,
      },
      {
        key: 'summarize',
        label: 'Summarize',
        description: 'Produce a short, useful summary of the selection.',
        instruction: 'Summarize the selection concisely',
        icon: <FileText className="size-4 shrink-0" />,
      },
    ];

  return (
    <>
      {/* AI popover (rendered outside of the main inline toolbar) */}
      <InlinePopover
        placement="bottom"
        defaultOpen={false}
        open={aiMenuOpen}
        onOpenChange={(open) => onOpenChange(open)}
        data-testid="inline-menu-ai"
        className="z-10 box-border border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg [&:not([data-state])]:hidden relative flex flex-col w-sm rounded-lg p-4 gap-y-3 items-stretch min-w-72 max-w-md"
      >
        {aiMenuOpen && (
          <div className="flex flex-col gap-3">
            {/* Result area first */}
            {(aiError || aiResult || isStreaming) && (
              <div className="flex flex-col gap-2">
                {aiError && (
                  <div className="text-xs text-red-600">{aiError}</div>
                )}
                {(aiResult || isStreaming) && (
                  <div className="max-h-48 overflow-auto text-sm whitespace-pre-wrap border border-gray-100 dark:border-gray-800 rounded-md p-2 bg-gray-50 dark:bg-gray-900">
                    {aiResult}
                    {isStreaming && (
                      <span className="ml-1 text-gray-400 animate-pulse">▍</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Suggested actions OR post-generation actions */}
            {aiResult ? (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    replaceSelectionWithText(aiResult);
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-0 bg-green-600 text-white hover:bg-green-700 h-9 px-3"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setAiResult('');
                    setAiError(null);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900 h-9 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    navigator.clipboard?.writeText(aiResult).catch(() => { });
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900 h-9 px-3"
                  title="Copy to clipboard"
                >
                  <ClipboardCheck className="size-4 mr-1" /> Copy
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runAI(s.instruction)}
                    className="flex w-full items-center justify-between rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{s.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {s.description}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Prompt input (Enter to run) */}
            <div className="relative">
              <input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isStreaming) {
                      runAI(
                        'Follow the instruction to transform the selection',
                      );
                    }
                  }
                }}
                placeholder="Ask AI about the selection…"
                className="flex h-9 rounded-md w-full bg-white dark:bg-gray-950 pl-3 pr-28 py-2 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 transition border box-border border-gray-200 dark:border-gray-800 border-solid ring-0 ring-transparent focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-0 outline-hidden focus-visible:outline-hidden file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                {isStreaming ? (
                  <span>Generating…</span>
                ) : (
                  <span>
                    Press <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">Enter</kbd>
                  </span>
                )}
              </div>
              {isStreaming && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => streamAbortRef.current?.()}
                  className="absolute right-2 -bottom-8 text-xs text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        )}
      </InlinePopover>
    </>
  );
}

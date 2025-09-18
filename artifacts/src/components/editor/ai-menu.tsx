import {
  ClipboardCheck,
  FileText,
  PencilLine,
  TextQuote,
  Wand2,
  Square,
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
  // Keep a reference to the previous complete result so we can restore it on abort
  const lastResultRef = useRef<string>('');
  const streamAbortRef = useRef<() => void>(() => { });
  const promptInputRef = useRef<HTMLInputElement | null>(null);
  // Tone controls removed per UX decision
  // Copy feedback state
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | undefined>(undefined);

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
      // Reset to initial state whenever the AI menu is closed by any means
      setAiResult('');
      setAiPrompt('');
      lastResultRef.current = '';
      // Clear copy feedback
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = undefined;
      }
      setCopied(false);
    }
  }, [aiMenuOpen]);

  // Reset copy UI on result/stream changes
  useEffect(() => {
    setCopied(false);
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = undefined;
    }
  }, [aiResult, isStreaming]);

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
  // Build a prompt that targets provided base text.
  const buildPrompt = (action: string, extra: string | undefined, baseText: string) => {
    const instruction = extra ? `${action}. ${extra}` : action;
    return [
      'You are a concise writing assistant. Return ONLY the transformed text without commentary, code fences, or backticks.',
      `Task: ${instruction}`,
      'Selection:',
      baseText || '(no selection)',
    ].join('\n\n');
  };

  //

  const runAI = async (instruction: string) => {
    // Determine the base text: subsequent runs should use the generated content
    const baseText = aiResult || getSelectedText();
    lastResultRef.current = aiResult; // snapshot for abort restore

    setAiError(null);
    setAiResult('');
    setIsStreaming(true);

    // Track local abort intent to avoid surfacing errors and to restore snapshot
    let aborted = false;
    const userExtra = aiPrompt.trim();
    // Clear input immediately so it's ready for next feedback
    setAiPrompt('');
    const prompt = buildPrompt(instruction, userExtra, baseText);

    try {
      const stream = nuwaClient.createAIStream({ prompt });
      // expose abort if available
      streamAbortRef.current = () => {
        aborted = true;
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
          if (aborted) {
            // Silently ignore abort errors; we'll restore the snapshot in finally
            return { content: [], isError: true };
          }
          setAiError(String(err ?? 'Unknown AI error'));
          setIsStreaming(false);
          return { content: [], isError: true };
        },
      });
    } catch (err) {
      // Only show when not aborted
      if (!/aborted/i.test(String(err))) {
        setAiError(String(err));
      }
    } finally {
      setIsStreaming(false);
      // If aborted, return to the last step (restore snapshot, clear error)
      if (aborted) {
        setAiError(null);
        setAiResult(lastResultRef.current);
      }
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
        label: 'Longer',
        description: 'Add helpful detail while keeping the original tone.',
        instruction: 'Make it longer with more detail while keeping the style',
        icon: <PencilLine className="size-4 shrink-0" />,
      },
      {
        key: 'summarize',
        label: 'Shorter',
        description: 'Produce a short, useful summary of the selection.',
        instruction: 'Shorten the selection while preserving meaning',
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
        className="z-10 box-border border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 shadow-lg [&:not([data-state])]:hidden relative flex flex-col rounded-lg p-4 gap-y-3 items-stretch min-w-[560px] max-w-[720px] w-[640px]"
      >
        {aiMenuOpen && (
          <div className="flex flex-col gap-3">
            {/* Result area first */}
            {(aiError || aiResult || isStreaming) && (
              <div className="flex flex-col gap-2">
                {aiError && (
                  <div className="text-xs text-red-600 dark:text-red-400">{aiError}</div>
                )}
                {(aiResult || isStreaming) && (
                  <div className="max-h-48 overflow-auto text-sm whitespace-pre-wrap border border-gray-100 dark:border-gray-800 rounded-md p-2 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                    {aiResult}
                    {isStreaming && (
                      <span className="ml-1 text-gray-400 dark:text-gray-400 animate-pulse">▍</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Suggested actions OR post-generation actions */}
            {aiResult && !isStreaming ? (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    replaceSelectionWithText(aiResult);
                    // Reset state and close; editor now contains the content
                    setAiPrompt('');
                    setAiResult('');
                    setAiError(null);
                    setIsStreaming(false);
                    lastResultRef.current = '';
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
                    // Reset to initial state without applying changes
                    setAiPrompt('');
                    setAiResult('');
                    setAiError(null);
                    setIsStreaming(false);
                    lastResultRef.current = '';
                    onOpenChange(false);
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900 h-9 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={async () => {
                    // Try modern clipboard API
                    let ok = false;
                    try {
                      await navigator.clipboard.writeText(aiResult);
                      ok = true;
                    } catch {
                      // Fallback to a hidden textarea and execCommand
                      try {
                        const ta = document.createElement('textarea');
                        ta.value = aiResult;
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        ta.style.pointerEvents = 'none';
                        document.body.appendChild(ta);
                        ta.focus();
                        ta.select();
                        ok = document.execCommand('copy');
                        document.body.removeChild(ta);
                      } catch {
                        ok = false;
                      }
                    }
                    if (ok) {
                      setCopied(true);
                      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
                      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
                    }
                  }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white dark:ring-offset-gray-950 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900 h-9 px-3 ml-auto"
                  title="Copy to clipboard"
                >
                  <ClipboardCheck className="size-4 mr-1" /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : (
              // Compact quick actions; roll horizontally; hidden after first generation
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {suggestions.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    disabled={isStreaming}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAiPrompt(s.instruction);
                      // Focus input so the user can tweak and hit Enter
                      try { promptInputRef.current?.focus(); } catch {}
                    }}
                    className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-900 h-8 px-2 text-xs disabled:opacity-50"
                    title={s.description}
                  >
                    {s.icon}
                    <span>{s.label}</span>
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
                        aiResult
                          ? 'Update the generated text based on this instruction'
                          : 'Follow the instruction to transform the selection',
                      );
                    }
                  }
                }}
                placeholder={
                  aiResult ? 'Provide feedback about the generated content…' : 'Ask AI about the selection…'
                }
                className="flex h-9 rounded-md w-full bg-white dark:bg-gray-950 pl-3 pr-28 py-2 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500 transition border box-border border-gray-200 dark:border-gray-800 border-solid ring-0 ring-transparent focus-visible:ring-2 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-300 focus-visible:ring-offset-0 outline-hidden focus-visible:outline-hidden file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isStreaming}
                ref={promptInputRef}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {isStreaming ? (
                  <>
                    <span>Generating…</span>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => streamAbortRef.current?.()}
                      className="inline-flex items-center gap-1 rounded border border-gray-300 dark:border-gray-700 px-2 py-0.5 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300"
                    >
                      <Square className="size-3" /> Abort
                    </button>
                  </>
                ) : (
                  <span>
                    Press <kbd className="rounded border border-gray-300 dark:border-gray-700 px-1">Enter</kbd>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </InlinePopover>
    </>
  );
}

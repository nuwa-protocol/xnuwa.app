import { canUseRegexLookbehind } from 'prosekit/core';
import { useEditor } from 'prosekit/react';
// no local state
import {
  AutocompleteList,
  AutocompletePopover,
} from 'prosekit/react/autocomplete';
// AI menu is rendered globally via context in the editor root
import { useAiMenu } from '@/contexts/AiMenuContext';
import type { EditorExtension } from './extension';
import SlashMenuEmpty from './slash-menu-empty';
import SlashMenuItem from './slash-menu-item';
import {
  Wand2,
  Type as TypeIcon,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered,
  ListChecks,
  ListCollapse,
  TextQuote,
  Table as TableIcon,
  Minus,
  SquareCode,
} from 'lucide-react';

export default function SlashMenu() {
  const editor = useEditor<EditorExtension>();
  const { setAiGenerateOpen } = useAiMenu();

  // Match inputs like "/", "/table", "/heading 1" etc. Do not match "/ heading".
  const regex = canUseRegexLookbehind() ? /(?<!\S)\/(|\S.*)$/u : /\/(|\S.*)$/u;

  return (
    <>
      <AutocompletePopover
        regex={regex}
        // Explicitly set text colors so the menu remains readable even if the
        // popover is portaled outside of the local `.dark` wrapper.
        className="relative block max-h-100 min-w-60 select-none overflow-auto whitespace-nowrap p-1 z-10 box-border rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 shadow-lg [&:not([data-state])]:hidden"
      >
        <AutocompleteList>
          <SlashMenuItem
            label="Generate with AI"
            icon={<Wand2 className="size-4 shrink-0" />}
            onSelect={() => {
              // Ensure the editor retains focus and open the AI menu in generate mode
              try {
                editor.view?.focus();
              } catch { }
              // Defer opening until after slash replacement is applied
              setTimeout(() => {
                try {
                  editor.view?.dispatch(editor.state.tr.scrollIntoView());
                } catch { }
                // Double-defer to ensure popover unmount completes in all environments
                requestAnimationFrame(() => setAiGenerateOpen(true));
              }, 30);
            }}
          />

          <SlashMenuItem
            label="Text"
            icon={<TypeIcon className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setParagraph()}
          />

          <SlashMenuItem
            label="Heading 1"
            kbd="#"
            icon={<Heading1 className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setHeading({ level: 1 })}
          />

          <SlashMenuItem
            label="Heading 2"
            kbd="##"
            icon={<Heading2 className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setHeading({ level: 2 })}
          />

          <SlashMenuItem
            label="Heading 3"
            kbd="###"
            icon={<Heading3 className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setHeading({ level: 3 })}
          />

          <SlashMenuItem
            label="Bullet list"
            kbd="-"
            icon={<ListIcon className="size-4 shrink-0" />}
            onSelect={() => editor.commands.wrapInList({ kind: 'bullet' })}
          />

          <SlashMenuItem
            label="Ordered list"
            kbd="1."
            icon={<ListOrdered className="size-4 shrink-0" />}
            onSelect={() => editor.commands.wrapInList({ kind: 'ordered' })}
          />

          <SlashMenuItem
            label="Task list"
            kbd="[]"
            icon={<ListChecks className="size-4 shrink-0" />}
            onSelect={() => editor.commands.wrapInList({ kind: 'task' })}
          />

          <SlashMenuItem
            label="Toggle list"
            kbd=">>"
            icon={<ListCollapse className="size-4 shrink-0" />}
            onSelect={() => editor.commands.wrapInList({ kind: 'toggle' })}
          />

          <SlashMenuItem
            label="Quote"
            kbd=">"
            icon={<TextQuote className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setBlockquote()}
          />

          <SlashMenuItem
            label="Table"
            icon={<TableIcon className="size-4 shrink-0" />}
            onSelect={() => editor.commands.insertTable({ row: 3, col: 3 })}
          />

          <SlashMenuItem
            label="Divider"
            kbd="---"
            icon={<Minus className="size-4 shrink-0" />}
            onSelect={() => editor.commands.insertHorizontalRule()}
          />

          <SlashMenuItem
            label="Code"
            kbd="```"
            icon={<SquareCode className="size-4 shrink-0" />}
            onSelect={() => editor.commands.setCodeBlock()}
          />

          <SlashMenuEmpty />
        </AutocompleteList>
      </AutocompletePopover>
      {/* AI menu rendered globally in Editor */}
    </>
  );
}

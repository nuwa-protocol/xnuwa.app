import { Bold, Code, Heading1, Heading2, Heading3, Image as ImageIcon, Italic, List, ListChecks, ListCollapse, ListOrdered, Minus, Redo2, SquareCode, Strikethrough, Underline, Undo2 } from 'lucide-react';
import type { Editor } from 'prosekit/core';
import { useEditorDerivedValue } from 'prosekit/react';
// Accept/Reject All moved to a floating dock; toolbar no longer shows them.
import Button from './button';
import type { EditorExtension } from './extension';
import { ImageUploadPopover } from './image-upload-popover';

// Suggestion presence handled by the floating dock component

function getToolbarItems(editor: Editor<EditorExtension>) {
  // Remove stray placeholder characters possibly left by suggestion operations
  const cleanupPlaceholders = () => {
    const { state, view } = editor;
    const ranges: Array<{ from: number; to: number }> = [];
    state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        for (let i = 0; i < node.text.length; i++) {
          const ch = node.text[i];
          if (ch === '¶' || ch === '\u200B') {
            ranges.push({ from: pos + i, to: pos + i + 1 });
          }
        }
      }
    });
    if (ranges.length === 0) return;
    let tr = state.tr;
    for (let i = ranges.length - 1; i >= 0; i--) {
      tr = tr.delete(ranges[i].from, ranges[i].to);
    }
    view.dispatch(tr);
  };
  return {
    undo: {
      isActive: false,
      canExec: editor.commands.undo.canExec(),
      command: editor.commands.undo,
    },
    redo: {
      isActive: false,
      canExec: editor.commands.redo.canExec(),
      command: editor.commands.redo,
    },
    bold: {
      isActive: editor.marks.bold.isActive(),
      canExec: editor.commands.toggleBold.canExec(),
      command: editor.commands.toggleBold,
    },
    italic: {
      isActive: editor.marks.italic.isActive(),
      canExec: editor.commands.toggleItalic.canExec(),
      command: editor.commands.toggleItalic,
    },
    underline: {
      isActive: editor.marks.underline.isActive(),
      canExec: editor.commands.toggleUnderline.canExec(),
      command: editor.commands.toggleUnderline,
    },
    strike: {
      isActive: editor.marks.strike.isActive(),
      canExec: editor.commands.toggleStrike.canExec(),
      command: editor.commands.toggleStrike,
    },
    code: {
      isActive: editor.marks.code.isActive(),
      canExec: editor.commands.toggleCode.canExec(),
      command: editor.commands.toggleCode,
    },
    codeBlock: {
      isActive: editor.nodes.codeBlock.isActive(),
      canExec: editor.commands.insertCodeBlock.canExec({
        language: 'javascript',
      }),
      command: () =>
        editor.commands.insertCodeBlock({ language: 'javascript' }),
    },
    heading1: {
      isActive: editor.nodes.heading.isActive({ level: 1 }),
      canExec: editor.commands.toggleHeading.canExec({ level: 1 }),
      command: () => editor.commands.toggleHeading({ level: 1 }),
    },
    heading2: {
      isActive: editor.nodes.heading.isActive({ level: 2 }),
      canExec: editor.commands.toggleHeading.canExec({ level: 2 }),
      command: () => editor.commands.toggleHeading({ level: 2 }),
    },
    heading3: {
      isActive: editor.nodes.heading.isActive({ level: 3 }),
      canExec: editor.commands.toggleHeading.canExec({ level: 3 }),
      command: () => editor.commands.toggleHeading({ level: 3 }),
    },
    horizontalRule: {
      isActive: editor.nodes.horizontalRule.isActive(),
      canExec: editor.commands.insertHorizontalRule.canExec(),
      command: editor.commands.insertHorizontalRule,
    },
    bulletList: {
      isActive: editor.nodes.list.isActive({ kind: 'bullet' }),
      canExec: editor.commands.toggleList.canExec({ kind: 'bullet' }),
      command: () => editor.commands.toggleList({ kind: 'bullet' }),
    },
    orderedList: {
      isActive: editor.nodes.list.isActive({ kind: 'ordered' }),
      canExec: editor.commands.toggleList.canExec({ kind: 'ordered' }),
      command: () => editor.commands.toggleList({ kind: 'ordered' }),
    },
    taskList: {
      isActive: editor.nodes.list.isActive({ kind: 'task' }),
      canExec: editor.commands.toggleList.canExec({ kind: 'task' }),
      command: () => editor.commands.toggleList({ kind: 'task' }),
    },
    toggleList: {
      isActive: editor.nodes.list.isActive({ kind: 'toggle' }),
      canExec: editor.commands.toggleList.canExec({ kind: 'toggle' }),
      command: () => editor.commands.toggleList({ kind: 'toggle' }),
    },
    insertImage: {
      isActive: false,
      canExec: editor.commands.insertImage.canExec(),
    },
  };
}

export default function Toolbar() {
  const items = useEditorDerivedValue(getToolbarItems);

  return (
    <div className="z-2 box-border border-gray-200 dark:border-gray-800 border-solid border-l-0 border-r-0 border-t-0 border-b flex flex-wrap gap-1 p-2 items-center justify-center">
      <Button
        pressed={items.undo.isActive}
        disabled={!items.undo.canExec}
        onClick={items.undo.command}
        tooltip="Undo"
      >
        <Undo2 className="size-5 block" />
      </Button>

      <Button
        pressed={items.redo.isActive}
        disabled={!items.redo.canExec}
        onClick={items.redo.command}
        tooltip="Redo"
      >
        <Redo2 className="size-5 block" />
      </Button>

      <Button
        pressed={items.bold.isActive}
        disabled={!items.bold.canExec}
        onClick={items.bold.command}
        tooltip="Bold"
      >
        <Bold className="size-5 block" />
      </Button>

      <Button
        pressed={items.italic.isActive}
        disabled={!items.italic.canExec}
        onClick={items.italic.command}
        tooltip="Italic"
      >
        <Italic className="size-5 block" />
      </Button>

      <Button
        pressed={items.underline.isActive}
        disabled={!items.underline.canExec}
        onClick={items.underline.command}
        tooltip="Underline"
      >
        <Underline className="size-5 block" />
      </Button>

      <Button
        pressed={items.strike.isActive}
        disabled={!items.strike.canExec}
        onClick={items.strike.command}
        tooltip="Strike"
      >
        <Strikethrough className="size-5 block" />
      </Button>

      <Button
        pressed={items.code.isActive}
        disabled={!items.code.canExec}
        onClick={items.code.command}
        tooltip="Code"
      >
        <Code className="size-5 block" />
      </Button>

      <Button
        pressed={items.codeBlock.isActive}
        disabled={!items.codeBlock.canExec}
        onClick={items.codeBlock.command}
        tooltip="Code Block"
      >
        <SquareCode className="size-5 block" />
      </Button>

      <Button
        pressed={items.heading1.isActive}
        disabled={!items.heading1.canExec}
        onClick={items.heading1.command}
        tooltip="Heading 1"
      >
        <Heading1 className="size-5 block" />
      </Button>

      <Button
        pressed={items.heading2.isActive}
        disabled={!items.heading2.canExec}
        onClick={items.heading2.command}
        tooltip="Heading 2"
      >
        <Heading2 className="size-5 block" />
      </Button>

      <Button
        pressed={items.heading3.isActive}
        disabled={!items.heading3.canExec}
        onClick={items.heading3.command}
        tooltip="Heading 3"
      >
        <Heading3 className="size-5 block" />
      </Button>

      <Button
        pressed={items.horizontalRule.isActive}
        disabled={!items.horizontalRule.canExec}
        onClick={items.horizontalRule.command}
        tooltip="Divider"
      >
        <Minus className="size-5 block" />
      </Button>

      <Button
        pressed={items.bulletList.isActive}
        disabled={!items.bulletList.canExec}
        onClick={items.bulletList.command}
        tooltip="Bullet List"
      >
        <List className="size-5 block" />
      </Button>

      <Button
        pressed={items.orderedList.isActive}
        disabled={!items.orderedList.canExec}
        onClick={items.orderedList.command}
        tooltip="Ordered List"
      >
        <ListOrdered className="size-5 block" />
      </Button>

      <Button
        pressed={items.taskList.isActive}
        disabled={!items.taskList.canExec}
        onClick={items.taskList.command}
        tooltip="Task List"
      >
        <ListChecks className="size-5 block" />
      </Button>

      <Button
        pressed={items.toggleList.isActive}
        disabled={!items.toggleList.canExec}
        onClick={items.toggleList.command}
        tooltip="Toggle List"
      >
        <ListCollapse className="size-5 block" />
      </Button>

      <ImageUploadPopover
        disabled={!items.insertImage.canExec}
        tooltip="Insert Image"
      >
        <ImageIcon className="size-5 block" />
      </ImageUploadPopover>

      {/* Accept/Reject All moved to floating dock */}
    </div>
  );
}

import 'prosekit/basic/style.css';
import 'prosekit/basic/typography.css';

import type { Editor as ProseKitEditor } from 'prosekit/core';
import { ProseKit, useDocChange } from 'prosekit/react';
import BlockHandle from './block-handle';
import DropIndicator from './drop-indicator';
import InlineMenu from './inline-menu';
import SlashMenu from './slash-menu';
import TableHandle from './table-handle';
import Toolbar from './toolbar';

export default function Editor({
  editor,
  onDocChange,
}: {
  editor: ProseKitEditor;
  onDocChange: () => void;
}) {
  useDocChange(onDocChange, { editor });

  return (
    <ProseKit editor={editor}>
      <div className=" h-screen w-full overflow-y-hidden overflow-x-hidden rounded-md border border-solid border-gray-200 dark:border-gray-700 shadow-sm flex flex-col bg-white dark:bg-gray-950 text-black dark:text-white">
        <Toolbar />
        <div className="relative w-full flex-1 box-border overflow-y-scroll">
          <div
            ref={editor.mount}
            className="ProseMirror box-border min-h-full px-[max(4rem,calc(50%-20rem))] py-8 outline-hidden outline-0 [&_span[data-mention=user]]:text-blue-500 [&_span[data-mention=tag]]:text-violet-500"
          ></div>
          <InlineMenu />
          <SlashMenu />
          <BlockHandle />
          <TableHandle />
          <DropIndicator />
        </div>
      </div>
    </ProseKit>
  );
}

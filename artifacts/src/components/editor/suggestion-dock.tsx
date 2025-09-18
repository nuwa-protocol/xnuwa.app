import { CheckCheck, X } from 'lucide-react';
import { useEditor, useEditorDerivedValue } from 'prosekit/react';
import {
  acceptAllSuggestions,
  hasSuggestionsInDoc,
  rejectAllSuggestions,
} from './suggestions';

export default function SuggestionDock() {
  const editor = useEditor() as any;
  const visible = useEditorDerivedValue((ed) =>
    hasSuggestionsInDoc(ed.state.doc),
  );

  if (!editor) return null;
  if (!visible) return null;

  const canExec = true;
  const onAcceptAll = () => editor.exec(acceptAllSuggestions);
  const onRejectAll = () => editor.exec(rejectAllSuggestions);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white dark:bg-gray-900 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 px-4 py-2">
        <button
          type="button"
          disabled={!canExec}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1.5"
          onClick={onAcceptAll}
        >
          <CheckCheck className="size-4" /> Accept All
        </button>
        <button
          type="button"
          disabled={!canExec}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm px-3 py-1.5"
          onClick={onRejectAll}
        >
          <X className="size-4" /> Reject All
        </button>
      </div>
    </div>
  );
}

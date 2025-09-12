import { useEffect, useRef, useState } from 'react';

type ArtifactTitleProps = {
  title: string;
};

export function ArtifactTitle({
  title,
}: ArtifactTitleProps) {
  const [localTitle, setLocalTitle] = useState<string>(title);
  useEffect(() => {
    // Keep local title in sync when external title changes
    setLocalTitle(title);
  }, [title]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<string>(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isEditing]);

  const handleCommit = (next: string) => {
    setLocalTitle(next);
    setIsEditing(false);
  };

  const handleBlur = () => {
    const next = (localTitle || '').trim();
    setLocalTitle(next);
    setIsEditing(false);
    if (next !== snapshot) handleCommit(next);
  };



  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={localTitle}
      onChange={(e) => setLocalTitle(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          setLocalTitle(snapshot);
          setIsEditing(false);
        }
      }}
      title="Enter to save · Esc to cancel"
      className="h-8 w-full rounded-md border border-border bg-background px-2 text-center text-sm font-medium text-foreground/90 shadow-sm outline-none transition-colors duration-150 md:text-base focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50"
      aria-label="Edit title"
    />
  ) : (
    <button
      type="button"
      className="w-full cursor-text truncate text-center text-sm font-medium text-foreground/90 hover:text-foreground md:text-base"
      onClick={() => {
        setSnapshot(localTitle);
        setIsEditing(true);
      }}
      title="Click to edit title"
      aria-label="Title. Click to edit."
    >
      {localTitle}
    </button>
  );
}


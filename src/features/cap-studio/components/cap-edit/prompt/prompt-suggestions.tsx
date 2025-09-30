import { GripVertical, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Input, Label } from '@/shared/components/ui';
import { CapPromptSuggestionSchema } from '@/shared/types';
import { cn } from '@/shared/utils';

interface PromptSuggestionsProps {
  suggestions: string[];
  onSuggestionsChange: (suggestions: string[]) => void;
  className?: string;
}

export function PromptSuggestions({
  suggestions,
  onSuggestionsChange,
  className,
}: PromptSuggestionsProps) {
  const [newSuggestion, setNewSuggestion] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  // Track drag state for simple HTML5 drag & drop reordering
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const validateInput = (value: string) => {
    const result = CapPromptSuggestionSchema.safeParse(value);
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message || 'Invalid input');
    } else {
      setValidationError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewSuggestion(value);
    validateInput(value);
  };

  // --- Drag & drop handlers (drag by handle only) ---
  const onDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    index: number,
  ) => {
    setDragIndex(index);
    // mark the payload so dropping on other items works even if state is stale
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOverItem = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    // must prevent default to allow dropping
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== index) setOverIndex(index);
  };

  const onDropOnItem = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    const fromIndexRaw = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
    const fromIndex = Number.isFinite(fromIndexRaw) ? Number(fromIndexRaw) : -1;
    const toIndex = index;

    if (
      fromIndex < 0 ||
      fromIndex >= suggestions.length ||
      toIndex < 0 ||
      toIndex >= suggestions.length ||
      fromIndex === toIndex
    ) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const next = suggestions.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onSuggestionsChange(next);
    setDragIndex(null);
    setOverIndex(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const addSuggestion = () => {
    const trimmed = newSuggestion.trim();
    const validation = CapPromptSuggestionSchema.safeParse(trimmed);

    if (!validation.success) {
      setValidationError(
        validation.error.errors[0]?.message || 'Invalid input',
      );
      return;
    }

    if (trimmed && !suggestions.includes(trimmed)) {
      onSuggestionsChange([...suggestions, trimmed]);
      setNewSuggestion('');
      setValidationError(null);
    }
  };

  const removeSuggestion = (index: number) => {
    onSuggestionsChange(suggestions.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSuggestion();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label htmlFor="suggestions-input" className="text-sm font-medium">
          Prompt Suggestions
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Add suggestions to help users get started with their prompts
        </p>
      </div>

      {/* Add new suggestion */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <Input
            id={`suggestions-input-${Math.random()}`}
            value={newSuggestion}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter a suggestion..."
            className={cn(
              'flex-1',
              validationError && 'border-red-500 focus:border-red-500',
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSuggestion}
            disabled={
              !newSuggestion.trim() ||
              suggestions.includes(newSuggestion.trim()) ||
              !!validationError
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {validationError && (
          <p className="text-xs text-red-500">{validationError}</p>
        )}
      </div>

      {/* Display existing suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Suggestions:</p>
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => {
              const isDragging = dragIndex === index;
              const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
              return (
                <div
                  key={suggestion}
                  onDragOver={(e) => onDragOverItem(e, index)}
                  onDrop={(e) => onDropOnItem(e, index)}
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-1 pr-1 text-sm w-full',
                      isDragging && 'opacity-50',
                      isOver && 'ring-2 ring-ring ring-offset-1',
                    )}
                  >
                    {/* drag handle (only this button is draggable) */}
                    <button
                      type="button"
                      aria-label="Drag to reorder"
                      title="Drag to reorder"
                      className={cn(
                        'cursor-grab active:cursor-grabbing rounded p-1 -ml-1 mr-1 hover:bg-muted-foreground/20',
                      )}
                      draggable
                      onDragStart={(e) => onDragStart(e, index)}
                      onDragEnd={onDragEnd}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>

                    <span className="truncate flex-1">{suggestion}</span>

                    <button
                      type="button"
                      onClick={() => removeSuggestion(index)}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      aria-label="Remove suggestion"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Input, Label } from '@/shared/components/ui';
import { CapPromptSuggestionSchema } from '@/shared/types/cap-new';
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
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="flex items-center gap-1 pr-1 text-sm"
              >
                <span className="truncate max-w-[200px]">{suggestion}</span>
                <button
                  type="button"
                  onClick={() => removeSuggestion(index)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

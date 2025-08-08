import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Input, Label } from '@/shared/components/ui';
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

  const addSuggestion = () => {
    const trimmed = newSuggestion.trim();
    if (trimmed && !suggestions.includes(trimmed)) {
      onSuggestionsChange([...suggestions, trimmed]);
      setNewSuggestion('');
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
      <div className="flex gap-2">
        <Input
          id={`suggestions-input-${Math.random()}`}
          value={newSuggestion}
          onChange={(e) => setNewSuggestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a suggestion..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSuggestion}
          disabled={
            !newSuggestion.trim() || suggestions.includes(newSuggestion.trim())
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
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

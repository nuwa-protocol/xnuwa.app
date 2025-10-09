import { Variable } from 'lucide-react';
import { useRef, useState } from 'react';
import { Markdown } from '@/shared/components/markdown';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/components/ui';
import { promptVariables } from '@/shared/constants/cap';
import { cn } from '@/shared/utils';
import { InlineUISetup } from './inline-ui-setup';
import { PromptSuggestions } from './prompt-suggestions';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  onSuggestionsChange?: (suggestions: string[]) => void;
  placeholder?: string;
  className?: string;
}

interface VariablesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVariableSelect: (variable: string) => void;
}

function VariablesDialog({
  isOpen,
  onOpenChange,
  onVariableSelect,
}: VariablesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <Variable className="h-4 w-4" />
          Variables
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader className="px-6">
          <DialogTitle>Prompt Variables</DialogTitle>
        </DialogHeader>
        <DialogDescription className="px-6">
          Use the following variables to make your prompt dynamic. Each variable
          will be replaced with the actual value before the prompt is sent to
          LLM.
        </DialogDescription>
        <div>
          {promptVariables.map((variable) => (
            <button
              key={variable.name}
              type="button"
              className="w-full text-left cursor-pointer hover:bg-accent rounded-md py-4 transition-colors m-0 px-6 border-t"
              onClick={() => {
                onVariableSelect(`\n\n${variable.value}\n`);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="font-mono text-xs px-2 py-0.5"
                >
                  {variable.name}
                </Badge>
              </div>
              <p className="text-sm mb-1">{variable.description}</p>
              <div className="flex flex-col items-start">
                <p className="text-xs font-semibold my-2">Example Prompt:</p>
                <pre className="w-full text-xs text-muted-foreground whitespace-pre-wrap font-mono p-2 bg-muted/20 rounded-md border">
                  {variable.example}
                </pre>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PromptEditor({
  value,
  onChange,
  suggestions = [],
  onSuggestionsChange,
  placeholder,
  className,
}: PromptEditorProps) {
  const [activeTab, setActiveTab] = useState('write');
  const [isVariablesDialogOpen, setIsVariablesDialogOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    setWordCount(
      newValue
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
    );
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    handleChange(newValue);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  };

  const insertVariable = (variable: string) => {
    insertText(variable);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Variables */}
          <VariablesDialog
            isOpen={isVariablesDialogOpen}
            onOpenChange={setIsVariablesDialogOpen}
            onVariableSelect={insertVariable}
          />
          {/* Inline UI Setup */}
          <InlineUISetup onInsertPrompt={insertText} />

        </div>
        {/* Improve Prompt (disabled for now) */}
        {/* <div className="flex items-center space-x-2">
          <ImprovePrompt prompt={value} onApply={handleChange} />
        </div> */}
      </div>

      {/* Editor */}
      <div className="relative">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="write">
            <span className="absolute top-4 right-4 text-xs text-muted-foreground">
              {wordCount} words
            </span>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[800px] font-mono text-sm resize-none"
            />
          </TabsContent>
          <TabsContent
            value="preview"
            className="min-h-[800px] p-3 border rounded-md bg-muted/20"
          >
            <div className="prose prose-sm max-w-none">
              <Markdown>{value || 'No content to preview'}</Markdown>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        Use variables like{' '}
        <Badge variant="secondary" className="text-xs mx-1">
          {'{{user_geo}}'}
        </Badge>
        to make your prompt dynamic.
      </div>

      {/* Prompt Suggestions */}
      {onSuggestionsChange && (
        <PromptSuggestions
          suggestions={suggestions}
          onSuggestionsChange={onSuggestionsChange}
          className="pt-4 border-t"
        />
      )}
    </div>
  );
}

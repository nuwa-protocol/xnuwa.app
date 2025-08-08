import { Maximize2, Save, Variable, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Markdown } from '@/features/chat/components/markdown';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/components/ui';
import { promptVariables } from '@/shared/constants/cap';
import { cn } from '@/shared/utils';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prompt Variables</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {promptVariables.map((variable) => (
            <button
              key={variable.name}
              type="button"
              className="w-full text-left cursor-pointer hover:bg-muted/30 rounded-md p-2 transition-colors"
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
              <p className="text-xs text-muted-foreground pl-1">
                {variable.description}
              </p>
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [drawerActiveTab, setDrawerActiveTab] = useState('write');
  const [isVariablesDialogOpen, setIsVariablesDialogOpen] = useState(false);
  const [isDrawerVariablesDialogOpen, setIsDrawerVariablesDialogOpen] =
    useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [drawerValue, setDrawerValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawerTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const openDrawer = () => {
    setDrawerValue(value);
    setIsDrawerOpen(true);
  };

  const handleDrawerSave = () => {
    onChange(drawerValue);
    setWordCount(
      drawerValue
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
    );
    setIsDrawerOpen(false);
  };

  const handleDrawerCancel = () => {
    setIsDrawerOpen(false);
  };

  const handleDrawerChange = (newValue: string) => {
    setDrawerValue(newValue);
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
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {wordCount} words
          </span>
          <Button variant="ghost" size="sm" type="button" onClick={openDrawer}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="write">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] font-mono text-sm resize-none"
            />
          </TabsContent>
          <TabsContent
            value="preview"
            className="min-h-[200px] p-3 border rounded-md bg-muted/20"
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

      {/* Bottom Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[80vh]">
          <div className="mx-auto w-full max-w-4xl p-6">
            <DrawerHeader className="px-0">
              <DrawerTitle>Prompt Editor</DrawerTitle>
            </DrawerHeader>

            <div className="flex-1 space-y-4">
              {/* Drawer Toolbar */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <Tabs
                    value={drawerActiveTab}
                    onValueChange={setDrawerActiveTab}
                  >
                    <TabsList>
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Variables */}
                  <VariablesDialog
                    isOpen={isDrawerVariablesDialogOpen}
                    onOpenChange={setIsDrawerVariablesDialogOpen}
                    onVariableSelect={(variable) => {
                      const textarea = drawerTextareaRef.current;
                      if (!textarea) return;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newValue =
                        drawerValue.substring(0, start) +
                        variable +
                        drawerValue.substring(end);
                      setDrawerValue(newValue);
                      setTimeout(() => {
                        textarea.focus();
                        textarea.selectionStart = textarea.selectionEnd =
                          start + variable.length;
                      }, 0);
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleDrawerCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleDrawerSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Drawer Editor */}
              <Tabs value={drawerActiveTab} onValueChange={setDrawerActiveTab}>
                <TabsContent value="write">
                  <Textarea
                    ref={drawerTextareaRef}
                    value={drawerValue}
                    onChange={(e) => handleDrawerChange(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[400px] font-mono text-sm resize-none"
                  />
                </TabsContent>
                <TabsContent
                  value="preview"
                  className="min-h-[400px] p-3 border rounded-md bg-muted/20"
                >
                  <div className="prose prose-sm max-w-none">
                    <Markdown>
                      {drawerValue || 'No content to preview'}
                    </Markdown>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Prompt Suggestions in Drawer */}
              {onSuggestionsChange && (
                <PromptSuggestions
                  suggestions={suggestions}
                  onSuggestionsChange={onSuggestionsChange}
                  className="pt-4 border-t"
                />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

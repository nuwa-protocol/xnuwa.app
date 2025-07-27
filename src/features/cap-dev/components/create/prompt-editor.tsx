import {
  Bold,
  Code, Eye,
  Italic,
  List,
  Maximize2,
  Minimize2,
  Sparkles, Variable
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
} from '@/shared/components/ui';
import { cn, generateUUID } from '@/shared/utils';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const promptVariables = [
  { name: '{{user_input}}', description: "The user's input or question" },
  { name: '{{context}}', description: 'Additional context from MCP servers' },
  { name: '{{date}}', description: 'Current date and time' },
  { name: '{{user_name}}', description: "The user's name" },
  {
    name: '{{previous_response}}',
    description: 'Previous AI response in the conversation',
  },
];

const promptTechniques = [
  {
    name: 'Chain of Thought',
    description: 'Encourage step-by-step reasoning',
    example:
      'Think through this step by step:\n1. First, analyze...\n2. Then, consider...\n3. Finally, conclude...',
  },
  {
    name: 'Role Playing',
    description: 'Define a specific role or persona',
    example:
      'You are an expert software engineer with 10+ years of experience. Your specialty is...',
  },
  {
    name: 'Few-Shot Examples',
    description: 'Provide examples of desired behavior',
    example:
      'Here are some examples of good responses:\n\nExample 1: [input] -> [output]\nExample 2: [input] -> [output]',
  },
  {
    name: 'Output Format',
    description: 'Specify the desired output structure',
    example:
      'Please format your response as:\n- Summary: [brief summary]\n- Details: [detailed explanation]\n- Next Steps: [actionable items]',
  },
];

export function PromptEditor({
  value,
  onChange,
  placeholder,
  className,
}: PromptEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  const insertTechnique = (technique: string) => {
    insertText('\n\n' + technique + '\n\n');
  };

  const formatText = (format: 'bold' | 'italic' | 'code' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'list':
        formattedText = selectedText
          ? selectedText
              .split('\n')
              .map((line) => `- ${line}`)
              .join('\n')
          : '- List item 1\n- List item 2\n- List item 3';
        break;
    }

    const newValue =
      value.substring(0, start) + formattedText + value.substring(end);
    handleChange(newValue);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          {/* Formatting tools */}
          <div className="flex items-center space-x-1 mr-4">
            <Toggle size="sm" onClick={() => formatText('bold')}>
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" onClick={() => formatText('italic')}>
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" onClick={() => formatText('code')}>
              <Code className="h-4 w-4" />
            </Toggle>
            <Toggle size="sm" onClick={() => formatText('list')}>
              <List className="h-4 w-4" />
            </Toggle>
          </div>

          {/* Variables */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Variable className="h-4 w-4 mr-2" />
                Variables
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Prompt Variables</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {promptVariables.map((variable) => (
                  <Card
                    key={variable.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => insertVariable(variable.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          {variable.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {variable.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Techniques */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Techniques
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prompt Engineering Techniques</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                {promptTechniques.map((technique) => (
                  <Card
                    key={technique.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => insertTechnique(technique.example)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {technique.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {technique.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3 font-mono bg-muted/50 p-2 rounded">
                        {technique.example}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {wordCount} words
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        className={cn(
          'relative',
          isFullscreen && 'fixed inset-0 z-50 bg-background p-6',
        )}
      >
        {isFullscreen && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Prompt Editor</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'min-h-[200px] font-mono text-sm resize-none',
            isFullscreen && 'min-h-[calc(100vh-200px)]',
          )}
        />

        {/* Preview */}
        {value && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="absolute bottom-3 right-3"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prompt Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs defaultValue="formatted">
                  <TabsList>
                    <TabsTrigger value="formatted">Formatted</TabsTrigger>
                    <TabsTrigger value="raw">Raw</TabsTrigger>
                  </TabsList>
                  <TabsContent value="formatted" className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      {value.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                          return (
                            <h1 key={generateUUID()} className="text-lg font-bold">
                              {line.substring(2)}
                            </h1>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h2 key={generateUUID()} className="text-base font-semibold">
                              {line.substring(3)}
                            </h2>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <li key={generateUUID()} className="ml-4">
                              {line.substring(2)}
                            </li>
                          );
                        }
                        if (line.includes('{{') && line.includes('}}')) {
                          return (
                            <p key={generateUUID()}>
                              {line.split(/({{[^}]+}})/).map((part, i) =>
                                part.startsWith('{{') && part.endsWith('}}') ? (
                                  <Badge
                                    key={generateUUID()}
                                    variant="secondary"
                                    className="mx-1"
                                  >
                                    {part}
                                  </Badge>
                                ) : (
                                  part
                                ),
                              )}
                            </p>
                          );
                        }
                        return line ? (
                          <p key={generateUUID()}>{line}</p>
                        ) : (
                          <br key={generateUUID()} />
                        );
                      })}
                    </div>
                  </TabsContent>
                  <TabsContent value="raw">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                      {value}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground">
        Use variables like{' '}
        <Badge variant="secondary" className="text-xs mx-1">
          {'{{user_input}}'}
        </Badge>
        to make your prompt dynamic. Format text with **bold**, *italic*, or
        `code`.
      </div>
    </div>
  );
}

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  Plus,
  RotateCcw,
  Save,
  Upload,
  Variable,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from '@/shared/components';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/components/ui';
import { generateUUID } from '@/shared/utils';

interface VariableTesterProps {
  variables: Record<string, string>;
  onChange: (variables: Record<string, string>) => void;
  prompt: string;
}

interface VariableSet {
  id: string;
  name: string;
  variables: Record<string, string>;
  createdAt: number;
}

const defaultVariableSets: VariableSet[] = [
  {
    id: 'basic',
    name: 'Basic Test',
    variables: {
      user_name: 'John Doe',
      user_input: 'Hello, how can I help you today?',
      context: 'General conversation',
      date: new Date().toLocaleString(),
    },
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'edge_case',
    name: 'Edge Cases',
    variables: {
      user_name: '',
      user_input: '',
      context: 'Empty inputs test',
      date: new Date().toLocaleString(),
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'long_input',
    name: 'Long Input',
    variables: {
      user_name: 'Alexander Hamilton',
      user_input:
        'This is a very long input that tests how the system handles extensive user queries with multiple sentences and complex requirements that might push the token limits and test the robustness of the prompt processing system.',
      context:
        'Complex multi-part request with detailed requirements and specifications',
      date: new Date().toLocaleString(),
    },
    createdAt: Date.now() - 1000 * 60 * 15,
  },
];

export function VariableTester({
  variables,
  onChange,
  prompt,
}: VariableTesterProps) {
  const [savedSets, setSavedSets] =
    useState<VariableSet[]>(defaultVariableSets);
  const [newVariableKey, setNewVariableKey] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Extract variables from prompt
  const promptVariables = useMemo(() => {
    const matches = prompt.match(/{{([^}]+)}}/g);
    return matches
      ? [...new Set(matches.map((match) => match.slice(2, -2)))]
      : [];
  }, [prompt]);

  // Check which variables are missing or unused
  const missingVariables = promptVariables.filter(
    (variable) => !(variable in variables),
  );
  const unusedVariables = Object.keys(variables).filter(
    (variable) => !promptVariables.includes(variable),
  );

  // Generate preview with variables replaced
  const previewPrompt = useMemo(() => {
    let preview = prompt;
    Object.entries(variables).forEach(([key, value]) => {
      preview = preview.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value || `[${key}]`,
      );
    });
    return preview;
  }, [prompt, variables]);

  const updateVariable = (key: string, value: string) => {
    onChange({ ...variables, [key]: value });
  };

  const addVariable = () => {
    if (newVariableKey.trim() && !variables[newVariableKey]) {
      onChange({ ...variables, [newVariableKey.trim()]: newVariableValue });
      setNewVariableKey('');
      setNewVariableValue('');
    }
  };

  const removeVariable = (key: string) => {
    const { [key]: removed, ...rest } = variables;
    onChange(rest);
  };

  const loadVariableSet = (setId: string) => {
    const set = savedSets.find((s) => s.id === setId);
    if (set) {
      onChange(set.variables);
      toast({
        type: 'success',
        description: `Loaded "${set.name}" variable set`,
      });
    }
  };

  const saveVariableSet = () => {
    const name = `Set ${savedSets.length + 1}`;
    const newSet: VariableSet = {
      id: `set_${Date.now()}`,
      name,
      variables: { ...variables },
      createdAt: Date.now(),
    };
    setSavedSets((prev) => [newSet, ...prev]);

    toast({
      type: 'success',
      description: `Saved as "${name}"`,
    });
  };

  const resetToDefaults = () => {
    const defaults: Record<string, string> = {};
    promptVariables.forEach((variable) => {
      switch (variable) {
        case 'user_name':
          defaults[variable] = 'Test User';
          break;
        case 'user_input':
          defaults[variable] = 'Hello, I need help with something.';
          break;
        case 'context':
          defaults[variable] = 'Testing environment';
          break;
        case 'date':
          defaults[variable] = new Date().toLocaleString();
          break;
        default:
          defaults[variable] = `[${variable}]`;
      }
    });
    onChange(defaults);
  };

  const exportVariables = () => {
    const data = {
      variables,
      timestamp: Date.now(),
      promptVariables,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'variables.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyVariables = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(variables, null, 2));
      toast({
        type: 'success',
        description: 'Variable configuration copied to clipboard',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to copy variables to clipboard',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-semibold">Variable Tester</h4>
          <p className="text-sm text-muted-foreground">
            Configure and test variables used in your cap's prompt
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Prompt Preview</DialogTitle>
                <DialogDescription>
                  See how your prompt looks with current variable values
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96 w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {previewPrompt}
                </pre>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={copyVariables}>
            <Copy className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={exportVariables}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Variables</TabsTrigger>
          <TabsTrigger value="sets">Saved Sets</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Current Variables */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Variable Values</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveVariableSet}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Set
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key} className="font-mono text-sm">
                      {`{{${key}}}`}
                    </Label>
                    <div className="flex items-center space-x-2">
                      {promptVariables.includes(key) ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Used
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Unused
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariable(key)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id={key}
                    value={value}
                    onChange={(e) => updateVariable(key, e.target.value)}
                    placeholder={`Enter value for ${key}...`}
                    rows={2}
                    className="font-mono text-sm"
                  />
                </div>
              ))}

              {/* Add new variable */}
              <div className="pt-4 border-t">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-key">Variable Name</Label>
                    <Input
                      id={generateUUID()}
                      value={newVariableKey}
                      onChange={(e) => setNewVariableKey(e.target.value)}
                      placeholder="variable_name"
                      className="font-mono"
                    />
                  </div>
                  <div className="flex-2 space-y-2">
                    <Label htmlFor="new-value">Value</Label>
                    <Input
                      id={generateUUID()}
                      value={newVariableValue}
                      onChange={(e) => setNewVariableValue(e.target.value)}
                      placeholder="Variable value..."
                    />
                  </div>
                  <Button
                    onClick={addVariable}
                    disabled={!newVariableKey.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sets" className="space-y-4">
          {/* Saved Variable Sets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Variable Sets</CardTitle>
              <CardDescription>
                Load predefined variable configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {savedSets.map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => loadVariableSet(set.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{set.name}</h4>
                        <Badge variant="outline">
                          {Object.keys(set.variables).length} variables
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(set.createdAt).toLocaleString()}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.keys(set.variables)
                          .slice(0, 5)
                          .map((key) => (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="text-xs font-mono"
                            >
                              {key}
                            </Badge>
                          ))}
                        {Object.keys(set.variables).length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(set.variables).length - 5} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Variable Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Missing Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                  Missing Variables
                </CardTitle>
                <CardDescription>
                  Variables used in prompt but not defined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {missingVariables.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All variables are defined</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {missingVariables.map((variable) => (
                      <div
                        key={variable}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <Badge variant="destructive" className="font-mono">
                          {`{{${variable}}}`}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => updateVariable(variable, '')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unused Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Variable className="h-4 w-4 mr-2 text-blue-500" />
                  Unused Variables
                </CardTitle>
                <CardDescription>
                  Defined variables not used in prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {unusedVariables.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>All variables are used</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {unusedVariables.map((variable) => (
                      <div
                        key={variable}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <Badge variant="secondary" className="font-mono">
                          {`{{${variable}}}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(variable)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prompt Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prompt Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {promptVariables.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Variables in Prompt
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(variables).length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Defined Variables
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {previewPrompt.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Preview Length
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.ceil(previewPrompt.length / 4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Est. Tokens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

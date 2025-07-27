import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Play,
  RotateCcw,
  Save,
  Square,
  Variable,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { LocalCap } from '@/features/cap-dev/stores';
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
  FormLabel,
  Progress,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/components/ui';
import { DashboardGrid } from '../layout/dashboard-layout';
import { DebugConsole } from './debug-console';
import { VariableTester } from './variable-tester';

interface CapTestEnvironmentProps {
  cap: LocalCap;
  onSaveTest?: (testCase: TestCase) => void;
}

interface TestCase {
  id: string;
  name: string;
  input: string;
  variables: Record<string, string>;
  expectedOutput?: string;
  createdAt: number;
}

interface TestResult {
  id: string;
  testCaseId: string;
  output: string;
  executionTime: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  status: 'success' | 'error' | 'timeout';
  error?: string;
  timestamp: number;
}

const sampleTestCases: TestCase[] = [
  {
    id: 'test_1',
    name: 'Basic Functionality',
    input: 'Hello, can you help me with a simple task?',
    variables: {
      user_name: 'John',
      context: 'This is a test scenario',
    },
    expectedOutput: 'A helpful response',
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'test_2',
    name: 'Edge Case',
    input: '',
    variables: {
      user_name: '',
      context: 'Empty input test',
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

export function CapTestEnvironment({
  cap,
  onSaveTest,
}: CapTestEnvironmentProps) {
  const [testInput, setTestInput] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({
    user_name: 'Test User',
    context: 'Testing environment',
    date: new Date().toLocaleString(),
    user_input: '',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [savedTests, setSavedTests] = useState<TestCase[]>(sampleTestCases);
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [showVariables, setShowVariables] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Update user_input variable when testInput changes
  useEffect(() => {
    setVariables((prev) => ({ ...prev, user_input: testInput }));
  }, [testInput]);

  const runTest = async () => {
    if (!testInput.trim()) {
      toast({
        type: 'error',
        description: 'Please enter some input to test',
      });
      return;
    }

    setIsRunning(true);
    setTestProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setTestProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Replace variables in the prompt
      let processedPrompt = cap.prompt;
      Object.entries(variables).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value,
        );
      });

      // Simulate API call to test the cap
      const startTime = Date.now();

      // Mock API response after delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (abortControllerRef.current?.signal.aborted) {
            reject(new Error('Test aborted'));
          } else {
            resolve(null);
          }
        }, 2000);
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Mock response
      const mockResponse = `Based on your input "${testInput}", here's a response from the ${cap.name} cap. This is a simulated response that would come from the ${cap.model.name} model with the configured prompt and variables.`;

      const result: TestResult = {
        id: `result_${Date.now()}`,
        testCaseId: selectedTest || `manual_${Date.now()}`,
        output: mockResponse,
        executionTime,
        tokenUsage: {
          input: Math.floor(testInput.length / 4), // Rough token estimate
          output: Math.floor(mockResponse.length / 4),
          total: Math.floor((testInput.length + mockResponse.length) / 4),
        },
        status: 'success',
        timestamp: Date.now(),
      };

      setTestProgress(100);
      setCurrentResult(result);
      setTestHistory((prev) => [result, ...prev].slice(0, 50)); // Keep last 50 results

      toast({
        type: 'success',
        description: `Executed in ${executionTime}ms`,
      });
    } catch (error) {
      const result: TestResult = {
        id: `result_${Date.now()}`,
        testCaseId: selectedTest || `manual_${Date.now()}`,
        output: '',
        executionTime: 0,
        tokenUsage: { input: 0, output: 0, total: 0 },
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };

      setCurrentResult(result);
      setTestHistory((prev) => [result, ...prev].slice(0, 50));

      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRunning(false);
      setTestProgress(0);
      abortControllerRef.current = null;
    }
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsRunning(false);
      setTestProgress(0);
    }
  };

  const saveCurrentTest = () => {
    const testCase: TestCase = {
      id: `test_${Date.now()}`,
      name: `Test ${savedTests.length + 1}`,
      input: testInput,
      variables: { ...variables },
      createdAt: Date.now(),
    };

    setSavedTests((prev) => [testCase, ...prev]);
    onSaveTest?.(testCase);

    toast({
      type: 'success',
      description: 'Test case saved for future use',
    });
  };

  const loadTest = (testId: string) => {
    const test = savedTests.find((t) => t.id === testId);
    if (test) {
      setTestInput(test.input);
      setVariables(test.variables);
      setSelectedTest(testId);
    }
  };

  const exportResults = () => {
    const data = {
      cap: {
        name: cap.name,
        version: cap.version,
        model: cap.model.name,
      },
      testResults: testHistory,
      timestamp: Date.now(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cap.name}_test_results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Test Environment</h3>
          <p className="text-sm text-muted-foreground">
            Test and debug "{cap.name}" in an isolated environment
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showVariables} onOpenChange={setShowVariables}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Variable className="h-4 w-4 mr-2" />
                Variables
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Test Variables</DialogTitle>
                <DialogDescription>
                  Configure variables that will be injected into your cap's
                  prompt
                </DialogDescription>
              </DialogHeader>
              <VariableTester
                variables={variables}
                onChange={setVariables}
                prompt={cap.prompt}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      <DashboardGrid cols={2}>
        {/* Test Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Input</CardTitle>
            <CardDescription>
              Enter input to test your cap's behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Saved Tests</FormLabel>
              <Select value={selectedTest} onValueChange={loadTest}>
                <SelectTrigger>
                  <SelectValue placeholder="Load a saved test..." />
                </SelectTrigger>
                <SelectContent>
                  {savedTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">Input Text</FormLabel>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter your test input here..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {testInput.length} characters • ~
                {Math.ceil(testInput.length / 4)} tokens
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={saveCurrentTest}
                disabled={!testInput.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Test
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Running test...</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}

            <div className="flex items-center space-x-2">
              {isRunning ? (
                <Button
                  onClick={stopTest}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Test
                </Button>
              ) : (
                <Button
                  onClick={runTest}
                  className="flex-1"
                  disabled={!testInput.trim()}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setTestInput('');
                  setCurrentResult(null);
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Results</CardTitle>
            <CardDescription>Output and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {currentResult ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  {currentResult.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge
                    variant={
                      currentResult.status === 'success'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {currentResult.status}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {currentResult.executionTime}ms
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {currentResult.tokenUsage.input}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Input Tokens
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {currentResult.tokenUsage.output}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Output Tokens
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {currentResult.tokenUsage.total}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Tokens
                    </div>
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">
                      Output
                    </FormLabel>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(currentResult.output)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-48 w-full rounded-md border p-3">
                    <div className="text-sm whitespace-pre-wrap">
                      {currentResult.status === 'error' ? (
                        <div className="text-red-500">
                          Error: {currentResult.error}
                        </div>
                      ) : (
                        currentResult.output
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run a test to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardGrid>

      {/* Debug Console */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Debug Console</CardTitle>
          <CardDescription>
            Detailed execution logs and debugging information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DebugConsole results={testHistory} isRunning={isRunning} />
        </CardContent>
      </Card>

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test History</CardTitle>
            <CardDescription>
              Previous test results and performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testHistory.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => setCurrentResult(result)}
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.tokenUsage.total} tokens •{' '}
                        {result.executionTime}ms
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      result.status === 'success' ? 'default' : 'destructive'
                    }
                  >
                    {result.status}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

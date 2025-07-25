import {
  AlertCircle,
  Bug, Copy,
  Filter,
  Info,
  Search,
  Terminal,
  Trash2,
  Zap
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent, Input,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';

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

interface DebugLog {
  id: string;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  testId?: string;
}

interface DebugConsoleProps {
  results: TestResult[];
  isRunning: boolean;
}

const generateDebugLogs = (results: TestResult[]): DebugLog[] => {
  const logs: DebugLog[] = [];

  results.forEach((result) => {
    // Start log
    logs.push({
      id: `${result.id}_start`,
      timestamp: result.timestamp - result.executionTime,
      level: 'info',
      message: `Starting test execution`,
      testId: result.id,
    });

    // Variable processing
    logs.push({
      id: `${result.id}_vars`,
      timestamp: result.timestamp - result.executionTime + 50,
      level: 'debug',
      message: `Processing variables and prompt template`,
      testId: result.id,
    });

    // Model request
    logs.push({
      id: `${result.id}_model`,
      timestamp: result.timestamp - result.executionTime + 100,
      level: 'info',
      message: `Sending request to model`,
      data: {
        inputTokens: result.tokenUsage.input,
        model: 'model-name',
      },
      testId: result.id,
    });

    if (result.status === 'error') {
      logs.push({
        id: `${result.id}_error`,
        timestamp: result.timestamp - 10,
        level: 'error',
        message: `Test execution failed: ${result.error}`,
        testId: result.id,
      });
    } else {
      // Response received
      logs.push({
        id: `${result.id}_response`,
        timestamp: result.timestamp - 50,
        level: 'info',
        message: `Received response from model`,
        data: {
          outputTokens: result.tokenUsage.output,
          totalTokens: result.tokenUsage.total,
        },
        testId: result.id,
      });

      // Completion
      logs.push({
        id: `${result.id}_complete`,
        timestamp: result.timestamp,
        level: 'info',
        message: `Test completed successfully in ${result.executionTime}ms`,
        testId: result.id,
      });
    }
  });

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export function DebugConsole({ results, isRunning }: DebugConsoleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const logs = generateDebugLogs(results);

  // Add running log if currently executing
  const allLogs = isRunning
    ? [
        {
          id: 'running',
          timestamp: Date.now(),
          level: 'info' as const,
          message: 'Test execution in progress...',
        },
        ...logs,
      ]
    : logs;

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [filteredLogs, autoScroll]);

  const clearLogs = () => {
    // This would clear the results in the parent component
    // For now, just show a toast
    console.log('Clear logs requested');
  };

  const copyLogs = async () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`,
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(logText);
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'warn':
        return <AlertCircle className="h-3 w-3" />;
      case 'info':
        return <Info className="h-3 w-3" />;
      case 'debug':
        return <Bug className="h-3 w-3" />;
      default:
        return <Terminal className="h-3 w-3" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{filteredLogs.length} entries</span>
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? (
                <>
                  <Zap className="h-3 w-3 mr-1 animate-pulse" />
                  Running
                </>
              ) : (
                'Idle'
              )}
            </Badge>
          </div>

          <Button variant="ghost" size="sm" onClick={copyLogs}>
            <Copy className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Console */}
      <Card className="bg-black text-green-400 font-mono text-sm">
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-96 w-full">
            <div className="p-4 space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No debug logs available</p>
                  <p className="text-xs">Run a test to see execution details</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      'flex items-start space-x-3 py-1 hover:bg-muted/10 rounded px-2 -mx-2',
                      log.level === 'error' && 'bg-red-500/10',
                      log.level === 'warn' && 'bg-yellow-500/10',
                    )}
                  >
                    <div className="text-muted-foreground text-xs mt-0.5 w-20 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>

                    <div
                      className={cn(
                        'flex items-center mt-0.5',
                        getLevelColor(log.level),
                      )}
                    >
                      {getLevelIcon(log.level)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={cn('break-words', getLevelColor(log.level))}
                      >
                        {log.message}
                      </div>

                      {log.data && (
                        <div className="text-xs text-muted-foreground mt-1 pl-4 border-l border-muted-foreground/20">
                          {Object.entries(log.data).map(([key, value]) => (
                            <div key={key}>
                              {key}: {JSON.stringify(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {log.testId && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="text-xs">
                            {log.testId.split('_')[1]}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Test ID: {log.testId}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Console Options */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            <span>Auto-scroll</span>
          </label>

          <div className="flex items-center space-x-2">
            <span>Levels:</span>
            <div className="flex items-center space-x-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Error</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Warn</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Info</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span>Debug</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          {filteredLogs.length > 0 && (
            <span>
              Latest: {new Date(filteredLogs[0].timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

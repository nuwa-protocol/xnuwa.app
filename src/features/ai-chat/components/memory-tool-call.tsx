import type { ToolInvocation } from 'ai';
import { Brain } from 'lucide-react';
import { generateUUID } from '@/shared/utils';
import { useDevMode } from '../../../shared/hooks/use-dev-mode';

interface MemoryToolCallProps {
  toolInvocation: ToolInvocation;
}

export function MemoryToolCall({ toolInvocation }: MemoryToolCallProps) {
  const { toolName, state } = toolInvocation;
  const isDevMode = useDevMode();

  if (toolName === 'saveMemory') {
    const savedMemory = state === 'result' && toolInvocation.result.memory ? toolInvocation.result.memory : null;
    const reason = state === 'result' && toolInvocation.result.reason ? toolInvocation.result.reason : null;
    return (
      <div className="flex flex-col text-xs text-muted-foreground rounded px-2 py-1">
        <div className="flex items-center gap-2">
          <Brain className="size-3" />
          <span>Saved memory</span>
        </div>
        
        {isDevMode && savedMemory && (
          <div className="mt-1 ml-5 bg-muted p-2 rounded max-h-32 overflow-y-auto">
            {typeof savedMemory === 'object' ? (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(savedMemory, null, 2)}
              </pre>
            ) : (
              <div>{String(savedMemory)}</div>
            )}
          </div>
        )}
        
        {isDevMode && reason && (
          <div className="mt-1 ml-5">
            <span className="text-muted-foreground">Reason: </span>
            <span>{reason}</span>
          </div>
        )}
      </div>
    );
  }

  if (toolName === 'queryMemory') {
    const memories = state === 'result' && Array.isArray(toolInvocation.result.memories) ? toolInvocation.result.memories : [];
    const reason = state === 'result' && toolInvocation.result.reason ? toolInvocation.result.reason : null;

    return (
      <div className="flex flex-col text-xs text-muted-foreground rounded px-2 py-1">
        <div className="flex items-center gap-2">
          <Brain className="size-3" />
          <span>
            Searched memories
            {isDevMode && memories.length > 0 && (
              <span className="ml-1">({memories.length})</span>
            )}
          </span>
        </div>
        
        {isDevMode && memories.length > 0 && (
          <div className="mt-1 ml-5 bg-muted p-2 rounded max-h-32 overflow-y-auto">
            {memories.map((memory: any) => (
              <div 
                key={`memory-${memory.id || JSON.stringify(memory).slice(0, 20)}-${generateUUID()}`} 
                className="mb-2 pb-2 border-b border-border last:border-0 last:mb-0 last:pb-0"
              >
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(memory, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
        
        {isDevMode && reason && (
          <div className="mt-1 ml-5">
            <span className="text-muted-foreground">Reason: </span>
            <span>{reason}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

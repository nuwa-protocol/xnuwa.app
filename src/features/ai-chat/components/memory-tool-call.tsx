import type { ToolInvocation } from 'ai';
import { Brain } from 'lucide-react';

interface MemoryToolCallProps {
  toolInvocation: ToolInvocation;
}

export function MemoryToolCall({ toolInvocation }: MemoryToolCallProps) {
  const { toolName, state } = toolInvocation;

  if (toolName === 'saveMemory') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground rounded px-2 py-1">
        <Brain className="size-3" />
        <span>Saved memory</span>
      </div>
    );
  }

  if (toolName === 'queryMemory') {
    const memories = state === 'result' && Array.isArray(toolInvocation.result) ? toolInvocation.result : [];

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground rounded px-2 py-1">
        <Brain className="size-3" />
        <span>
          Searched memories
        </span>
      </div>
    );
  }

  return null;
}

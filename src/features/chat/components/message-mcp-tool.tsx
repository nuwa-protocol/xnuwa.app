import type { ToolUIPart } from 'ai';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  ToolResult,
} from '@/shared/components/ui/shadcn-io/tool';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';

const RemoteMCPToolCallID = ({ toolCallId }: { toolCallId: string }) => {
  const [copy, isCopied] = useCopyToClipboard();
  return (
    <div className="text-xs text-muted-foreground ml-6">
      Tool Call ID:{' '}
      <code
        className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs font-mono cursor-pointer hover:bg-muted-foreground/10"
        onClick={() => copy(toolCallId)}
      >
        {isCopied ? 'Copied' : toolCallId}
      </code>
    </div>
  );
};

const RemoteMCPToolLoading = ({
  input,
  toolCallId,
}: {
  input: ToolUIPart['input'];
  toolCallId: string;
}) => {
  return (
    <div>
      <RemoteMCPToolCallID toolCallId={toolCallId} />
      <ToolInput input={input} />
    </div>
  );
};

const RemoteMCPToolResult = ({
  input,
  output,
  toolCallId,
}: {
  input: ToolUIPart['input'];
  output: ToolUIPart['output'];
  toolCallId: string;
}) => {
  return (
    <div>
      <RemoteMCPToolCallID toolCallId={toolCallId} />
      <ToolInput input={input} />
      <ToolOutput
        output={<ToolResult result={output} />}
        errorText={undefined}
      />
    </div>
  );
};

export const RemoteMCPTool = ({
  input,
  output,
  toolCallId,
  toolName,
  state,
}: {
  input: ToolUIPart['input'];
  output: ToolUIPart['output'];
  toolCallId: string;
  toolName: string;
  state: ToolUIPart['state'];
}) => {
  return (
    <Tool key={toolCallId} defaultOpen={false}>
      <ToolHeader type={`tool-${toolName}`} state={state} />
      <ToolContent>
        {state === 'input-available' && (
          <RemoteMCPToolLoading input={input} toolCallId={toolCallId} />
        )}
        {state === 'output-available' && (
          <RemoteMCPToolResult
            input={input}
            output={output}
            toolCallId={toolCallId}
          />
        )}
      </ToolContent>
    </Tool>
  );
};

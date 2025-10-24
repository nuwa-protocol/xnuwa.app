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
  errorText
}: {
  input: ToolUIPart['input'];
  output: ToolUIPart['output'];
  toolCallId: string;
  errorText: ToolUIPart['errorText']
}) => {
  return (
    <div>
      <RemoteMCPToolCallID toolCallId={toolCallId} />
      <ToolInput input={input} />
      <ToolOutput
        output={!errorText ? <ToolResult result={output} /> : undefined}
        errorText={errorText}
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
  errorText
}: {
  input: ToolUIPart['input'];
  output: ToolUIPart['output'];
  toolCallId: string;
  toolName: string;
  state: ToolUIPart['state'];
  errorText: ToolUIPart['errorText']
}) => {
  return (
    <Tool key={toolCallId} defaultOpen={false}>
      <ToolHeader type={`tool-${toolName}`} state={state} />
      <ToolContent>
        {state === 'input-available' || state === 'input-streaming' && (
          <RemoteMCPToolLoading input={input} toolCallId={toolCallId} />
        )}
        {state === 'output-available' || state === 'output-error' && (
          <RemoteMCPToolResult
            input={input}
            output={output}
            toolCallId={toolCallId}
            errorText={errorText}
          />
        )}
      </ToolContent>
    </Tool>
  );
};

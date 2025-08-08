import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { cn } from '@/shared/utils';

interface ToolResultProps {
  toolName: string;
  toolCallId: string;
  result: any;
  args?: Record<string, any>;
  className?: string;
}

export const ToolResult = ({
  toolName,
  toolCallId,
  result,
  args,
  className,
}: ToolResultProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatResult = (result: any) => {
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result, null, 2);
  };

  return (
    <Card className={cn('w-full py-4', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Tool Result</span>
              <Badge variant="outline" className="text-xs">
                {toolName}
              </Badge>
              <div className="ml-auto">
                {isOpen ? (
                  <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                ID:{' '}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  {toolCallId}
                </code>
              </div>
              {args && Object.keys(args).length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    Arguments:
                  </div>
                  <div className="bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto">
                    <pre>{JSON.stringify(args, null, 2)}</pre>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  Result:
                </div>
                <div className="bg-muted p-2 rounded-md text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {formatResult(result)}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

import type { ArtifactContent } from '@/artifacts/types';
import { CodeEditor } from './code-editor';
import { Console, type ConsoleOutput } from './console';

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

export function CodeContent(props: ArtifactContent<Metadata>) {
  return (
    <>
      <div className="px-1">
        <CodeEditor {...props} />
      </div>
      {props.metadata?.outputs && (
        <Console
          consoleOutputs={props.metadata.outputs}
          setConsoleOutputs={() => {
            props.setMetadata({
              ...props.metadata,
              outputs: [],
            });
          }}
        />
      )}
    </>
  );
}

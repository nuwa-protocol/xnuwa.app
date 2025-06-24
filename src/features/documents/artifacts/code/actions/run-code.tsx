import { PlayIcon } from 'lucide-react';
import { generateUUID } from '@/shared/utils';
import type { ArtifactAction } from '../../types';
import type {
  ConsoleOutput,
  ConsoleOutputContent,
} from '../components/console';
import { getLocaleText } from '@/shared/locales';

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ['basic'];

  if (code.includes('matplotlib') || code.includes('plt.')) {
    handlers.push('matplotlib');
  }

  return handlers;
}

export function createRunCodeAction(): ArtifactAction<Metadata> {

  return {
    icon: <PlayIcon size={18} />,
    label: undefined as any,
    description: getLocaleText('en').t('artifact.code.actions.run'),
    onClick: async ({ content, setMetadata }) => {
      const runId = generateUUID();
      const outputContent: Array<ConsoleOutputContent> = [];

      setMetadata((metadata) => ({
        ...metadata,
        outputs: [
          ...metadata.outputs,
          {
            id: runId,
            contents: [],
            status: 'in_progress',
          },
        ],
      }));

      try {
        // @ts-expect-error - loadPyodide is not defined
        const currentPyodideInstance = await globalThis.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
        });

        currentPyodideInstance.setStdout({
          batched: (output: string) => {
            outputContent.push({
              type: output.startsWith('data:image/png;base64')
                ? 'image'
                : 'text',
              value: output,
            });
          },
        });

        await currentPyodideInstance.loadPackagesFromImports(content, {
          messageCallback: (message: string) => {
            setMetadata((metadata) => ({
              ...metadata,
              outputs: [
                ...metadata.outputs.filter((output) => output.id !== runId),
                {
                  id: runId,
                  contents: [{ type: 'text', value: message }],
                  status: 'loading_packages',
                },
              ],
            }));
          },
        });

        const requiredHandlers = detectRequiredHandlers(content);
        for (const handler of requiredHandlers) {
          if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
            await currentPyodideInstance.runPythonAsync(
              OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS],
            );

            if (handler === 'matplotlib') {
              await currentPyodideInstance.runPythonAsync(
                'setup_matplotlib_output()',
              );
            }
          }
        }

        await currentPyodideInstance.runPythonAsync(content);

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs.filter((output) => output.id !== runId),
            {
              id: runId,
              contents: outputContent,
              status: 'completed',
            },
          ],
        }));
      } catch (error: any) {
        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs.filter((output) => output.id !== runId),
            {
              id: runId,
              contents: [{ type: 'text', value: error.message }],
              status: 'failed',
            },
          ],
        }));
      }
    },
  };
}

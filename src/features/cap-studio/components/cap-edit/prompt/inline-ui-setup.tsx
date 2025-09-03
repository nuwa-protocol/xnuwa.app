import { Lightbulb, Monitor, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from '@/shared/components/ui';

interface Parameter {
  id: string;
  key: string;
  description: string;
}

interface URLConfig {
  id: string;
  url: string;
  title: string;
  description: string;
  parameters: Parameter[];
  urlError?: string;
}

interface InlineUISetupProps {
  onInsertPrompt: (prompt: string) => void;
}

export function InlineUISetup({ onInsertPrompt }: InlineUISetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [urlConfigs, setUrlConfigs] = useState<URLConfig[]>([
    {
      id: '1',
      url: '',
      title: '',
      description: '',
      parameters: [],
    },
  ]);

  const validateUrl = (url: string): string => {
    if (!url.trim()) {
      return 'URL is required';
    }
    try {
      new URL(url);
      return '';
    } catch {
      return 'Please enter a valid URL (must start with http:// or https://)';
    }
  };

  const addUrlConfig = () => {
    const newConfig: URLConfig = {
      id: Date.now().toString(),
      url: '',
      title: '',
      description: '',
      parameters: [],
    };
    setUrlConfigs([...urlConfigs, newConfig]);
  };

  const removeUrlConfig = (id: string) => {
    setUrlConfigs(urlConfigs.filter((config) => config.id !== id));
  };

  const updateUrlConfig = (
    id: string,
    field: keyof URLConfig,
    value: string,
  ) => {
    setUrlConfigs(
      urlConfigs.map((config) => {
        if (config.id === id) {
          const updatedConfig = { ...config, [field]: value };
          // Validate URL if it's the URL field
          if (field === 'url') {
            updatedConfig.urlError = validateUrl(value);
          }
          return updatedConfig;
        }
        return config;
      }),
    );
  };

  const addParameter = (configId: string) => {
    setUrlConfigs(
      urlConfigs.map((config) =>
        config.id === configId
          ? {
            ...config,
            parameters: [
              ...config.parameters,
              { id: Date.now().toString(), key: '', description: '' },
            ],
          }
          : config,
      ),
    );
  };

  const removeParameter = (configId: string, paramId: string) => {
    setUrlConfigs(
      urlConfigs.map((config) =>
        config.id === configId
          ? {
            ...config,
            parameters: config.parameters.filter(
              (param) => param.id !== paramId,
            ),
          }
          : config,
      ),
    );
  };

  const updateParameter = (
    configId: string,
    paramId: string,
    field: 'key' | 'description',
    value: string,
  ) => {
    setUrlConfigs(
      urlConfigs.map((config) =>
        config.id === configId
          ? {
            ...config,
            parameters: config.parameters.map((param) =>
              param.id === paramId ? { ...param, [field]: value } : param,
            ),
          }
          : config,
      ),
    );
  };

  const addExampleWeatherComponent = () => {
    const exampleConfig: URLConfig = {
      id: Date.now().toString(),
      url: 'http://localhost:3000/weather',
      title: 'Weather Card',
      description:
        'Displays current weather information for a specific location',
      parameters: [
        {
          id: `${Date.now()}-1`,
          key: 'latitude',
          description:
            'Latitude coordinate of the location (e.g., 40.7128 for New York)',
        },
        {
          id: `${Date.now()}-2`,
          key: 'longitude',
          description:
            'Longitude coordinate of the location (e.g., -74.0060 for New York)',
        },
      ],
      urlError: '',
    };
    setUrlConfigs([...urlConfigs, exampleConfig]);
  };

  const generatePrompt = () => {
    const validConfigs = urlConfigs.filter(
      (config) => config.url.trim() && !config.urlError,
    );

    if (validConfigs.length === 0) return '';

    let prompt = `## Inline UI Rendering Instructions

You can render interactive UI components inline within your response by using this special markdown syntax:

\`![capui:::title](url)\` or \`![capui:::](url)\`

### Rules
- You can render an inline UI component with this markdown syntax with an optional title and url.
- When appropriate based on the user's request, use these components to provide interactive functionality. 
- The url will be specified in the \`Available UI Components\` section. 
- If the url supports query parameters, you can fill in the parameter values dynamically based on the context and user's needs.
- Append parameters as query string. For example: \`![capui:::title](https://example.com?param1=value1&param2=value2)\`
- Each component should be placed on its own line. 

### Available UI Components:

`;

    validConfigs.forEach((config) => {
      const titlePart = config.title || 'Component';

      prompt += `#### ${titlePart}\n`;
      if (config.description) {
        prompt += `${config.description}\n`;
      }

      prompt += `Base URL: ${config.url}\n`;

      if (config.parameters.length > 0) {
        prompt += `\nParameters:\n`;
        config.parameters.forEach((param) => {
          if (param.key.trim() && param.description.trim()) {
            prompt += `- **${param.key}**: ${param.description}\n`;
          }
        });
      } else {
        prompt += `Usage: \`![capui:::${config.title}](${config.url})\`\n`;
      }

      prompt += '\n';
    });

    return prompt;
  };

  const handleConfirm = () => {
    // Check for any validation errors
    const hasErrors = urlConfigs.some((config) => config.urlError);
    const hasValidUrls = urlConfigs.some(
      (config) => config.url.trim() && !config.urlError,
    );

    if (hasErrors) {
      return; // Don't proceed if there are validation errors
    }

    if (!hasValidUrls) {
      return; // Don't proceed if no valid URLs
    }

    const prompt = generatePrompt();
    if (prompt) {
      onInsertPrompt(`\n\n${prompt}\n\n`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <Monitor className="h-4 w-4" />
          Inline UI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setup Inline UI Components</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {urlConfigs.map((config, index) => (
            <div key={config.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Component {index + 1}</h3>
                {urlConfigs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUrlConfig(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL *</Label>
                  <Input
                    placeholder="https://example.com/component"
                    value={config.url}
                    onChange={(e) =>
                      updateUrlConfig(config.id, 'url', e.target.value)
                    }
                    className={config.urlError ? 'border-red-500' : ''}
                  />
                  {config.urlError && (
                    <p className="text-xs text-red-500">{config.urlError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Component title (optional)"
                    value={config.title}
                    onChange={(e) =>
                      updateUrlConfig(config.id, 'title', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe when to use this component..."
                  value={config.description}
                  onChange={(e) =>
                    updateUrlConfig(config.id, 'description', e.target.value)
                  }
                  className="h-20"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>URL Parameters</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addParameter(config.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Parameter
                  </Button>
                </div>

                {config.parameters.map((param) => (
                  <div key={param.id} className="flex flex-row gap-2">
                    <Input
                      placeholder="Parameter key"
                      value={param.key}
                      onChange={(e) =>
                        updateParameter(
                          config.id,
                          param.id,
                          'key',
                          e.target.value,
                        )
                      }
                      className="w-1/4"
                    />
                    <Input
                      placeholder="Parameter description (how AI should fill this)"
                      value={param.description}
                      onChange={(e) =>
                        updateParameter(
                          config.id,
                          param.id,
                          'description',
                          e.target.value,
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameter(config.id, param.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addUrlConfig} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Component
            </Button>
            <Button variant="outline" onClick={addExampleWeatherComponent}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Add Example
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                urlConfigs.some((config) => config.urlError) ||
                !urlConfigs.some(
                  (config) => config.url.trim() && !config.urlError,
                )
              }
            >
              Insert Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

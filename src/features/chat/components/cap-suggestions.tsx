import { motion } from 'framer-motion';
import { CapThumbnail } from '@/features/cap-store/components/cap-thumbnail';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { Cap } from '@/shared/types';

const mockCapSuggestions: Cap[] = [
  {
    id: 'code-assistant',
    authorDID: 'default',
    idName: 'code-assistant',
    metadata: {
      displayName: 'Code Assistant',
      description: 'Help with programming tasks and code review',
      author: 'Nuwa',
      tags: ['Programming', 'Development'],
      submittedAt: Date.now(),
    },
    core: {
      prompt: {
        value: 'You are a helpful coding assistant.',
      },
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        slug: 'gpt-4',
        providerName: 'OpenAI',
        providerSlug: 'openai',
        description: 'OpenAI GPT-4 model',
        context_length: 8192,
        pricing: {
          input_per_million_tokens: 30,
          output_per_million_tokens: 60,
          request_per_k_requests: 0,
          image_per_k_images: 0,
          web_search_per_k_searches: 0,
        },
        supported_inputs: ['text'],
        supported_parameters: ['temperature', 'max_tokens'],
      },
      mcpServers: {},
    },
  },
  {
    id: 'research-helper',
    authorDID: 'default',
    idName: 'research-helper',
    metadata: {
      displayName: 'Research Helper',
      description: 'Find and summarize information from various sources',
      author: 'Nuwa',
      tags: ['Research', 'Analysis'],
      submittedAt: Date.now(),
    },
    core: {
      prompt: {
        value: 'You are a research assistant.',
      },
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        slug: 'gpt-4',
        providerName: 'OpenAI',
        providerSlug: 'openai',
        description: 'OpenAI GPT-4 model',
        context_length: 8192,
        pricing: {
          input_per_million_tokens: 30,
          output_per_million_tokens: 60,
          request_per_k_requests: 0,
          image_per_k_images: 0,
          web_search_per_k_searches: 0,
        },
        supported_inputs: ['text'],
        supported_parameters: ['temperature', 'max_tokens'],
      },
      mcpServers: {},
    },
  },
  {
    id: 'writing-companion',
    authorDID: 'default',
    idName: 'writing-companion',
    metadata: {
      displayName: 'Writing Companion',
      description: 'Assist with creative writing and content creation',
      author: 'Nuwa',
      tags: ['Writing', 'Creative'],
      submittedAt: Date.now(),
    },
    core: {
      prompt: {
        value: 'You are a creative writing assistant.',
      },
      model: {
        id: 'gpt-4',
        name: 'GPT-4',
        slug: 'gpt-4',
        providerName: 'OpenAI',
        providerSlug: 'openai',
        description: 'OpenAI GPT-4 model',
        context_length: 8192,
        pricing: {
          input_per_million_tokens: 30,
          output_per_million_tokens: 60,
          request_per_k_requests: 0,
          image_per_k_images: 0,
          web_search_per_k_searches: 0,
        },
        supported_inputs: ['text'],
        supported_parameters: ['temperature', 'max_tokens'],
      },
      mcpServers: {},
    },
  },
];

interface CapSuggestionsProps {
  onCapSelect?: (capId: string) => void;
}

export function CapSuggestions({ onCapSelect }: CapSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-3xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-4"
      >
        <h3 className="text-lg font-medium text-foreground mb-1">
          Get started with popular CAPs
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose an AI assistant to help with your tasks
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mockCapSuggestions.map((cap, index) => (
          <motion.div
            key={cap.idName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Card
              className="cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:shadow-md border-border/50 bg-gradient-to-br from-background to-muted/20"
              onClick={() => onCapSelect?.(cap.idName)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CapThumbnail cap={cap} size="md" />
                    <h3 className="font-medium text-sm truncate">
                      {cap.metadata.displayName}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {cap.metadata.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cap.metadata.tags?.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

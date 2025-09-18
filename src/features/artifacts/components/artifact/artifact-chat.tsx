import { useChat } from '@ai-sdk/react';
import { BookOpen, Brain, Sparkles, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/features/chat/components/conversation';
import Header from '@/features/chat/components/header';
import { Messages } from '@/features/chat/components/messages';
import { MultimodalInput } from '@/features/chat/components/multimodal-input';
import { useChatContext } from '@/features/chat/contexts/chat-context';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

type RecommendedCap = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const RECOMMENDED_CAPS: RecommendedCap[] = [
  {
    id: 'cap-explainer',
    name: 'Doc Explainer',
    description: 'Explain key parts of this artifact.',
    icon: BookOpen,
  },
  {
    id: 'cap-reviewer',
    name: 'Code Reviewer',
    description: 'Review and suggest improvements.',
    icon: Brain,
  },
  {
    id: 'cap-tools',
    name: 'Tool Runner',
    description: 'Run helpful tools as needed.',
    icon: Wrench,
  },
];

// Chat area for the Artifact page. Shows an elegant empty state when there are no messages yet.
export function ArtifactChat() {
  const { chat } = useChatContext();
  const { messages } = useChat({ chat });

  const isEmpty = useMemo(() => messages.length === 0, [messages.length]);

  return (
    <div className="flex flex-col relative min-w-0 h-screen bg-background">
      <Header chatId={chat.id} />

      {isEmpty ? (
        <Conversation>
          <ConversationContent className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-5 rounded-2xl border bg-muted/30 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Sparkles className="h-5 w-5" />
                {/* TODO: here should show some metadata about the Artifact */}
                <span className="text-sm font-medium">AI Artifact</span>
              </div>
              {/* TODO: here should be the Artifact Name */}
              <h2 className="text-lg font-semibold mb-1">About Artifact</h2>
              {/* TODO: Here should be artifact guideline */}
              <p className="text-muted-foreground text-sm mb-3">
                Ask a question or describe what you want to do.
              </p>
              <div className="mt-4 text-left">
                {/* TODO: here should be the recommended caps */}
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Recommended Caps
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {RECOMMENDED_CAPS.map(
                    ({ id, name, description, icon: Icon }) => (
                      <Card key={id} className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <div className="text-sm font-medium">{name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {description}
                        </div>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 rounded-full text-xs"
                            type="button"
                          >
                            Use Cap
                          </Button>
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <Messages isReadonly={false} />
      )}

      <div
        className={
          'flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-4xl'
        }
      >
        <MultimodalInput className={undefined} />
      </div>
    </div>
  );
}

export default ArtifactChat;

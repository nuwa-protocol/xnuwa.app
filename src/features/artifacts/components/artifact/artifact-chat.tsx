import { useChat } from '@ai-sdk/react';
import { Package, Sparkles } from 'lucide-react';
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
import { ArtifactSessionsStore } from '../../stores';

// Chat area for the Artifact page. Shows an elegant empty state when there are no messages yet.
export function ArtifactChat({ artifactId }: { artifactId: string }) {
  const { chat } = useChatContext();
  const { messages } = useChat({ chat });
  const { artifactSessions } = ArtifactSessionsStore()
  const artifactSession = artifactSessions[artifactId]

  const isEmpty = useMemo(() => messages.length === 0, [messages.length]);

  const hasRecommendedCaps = useMemo(() => artifactSession.artifact.core.recomendedCaps.length > 0, [artifactSession.artifact.core.recomendedCaps.length]);

  if (!artifactSession) {
    return <div>Artifact session not found</div>;
  }

  return (
    <div className="flex flex-col relative min-w-0 h-screen bg-background">
      <Header chatId={chat.id} />

      {isEmpty ? (
        <Conversation>
          <ConversationContent className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-5 rounded-2xl border bg-muted/30 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-lg font-semibold mb-1">Getting Started with {artifactSession.artifact.metadata.displayName}</h2>
              </div>
              {/* TODO: Here should be artifact guideline */}
              <p className="text-muted-foreground text-sm mb-3">
                {artifactSession.artifact.metadata.description}
              </p>
              {hasRecommendedCaps && (
                <div className="mt-4 text-left">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Recommended Caps
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {artifactSession.artifact.core.recomendedCaps.map(
                      (cap) => (
                        <Card key={cap.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <div className="text-sm font-medium">{cap.idName}</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {cap.id}
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
              )}
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

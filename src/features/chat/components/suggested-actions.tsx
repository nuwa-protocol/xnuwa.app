import { motion } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/shared/components/ui';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { useChatContext } from '../contexts';

function PureSuggestedActions() {
  const { chatState } = useChatContext();
  const { sendMessage } = chatState;
  const { currentCap: cap } = useCurrentCap();

  const suggestedActions =
    cap?.core.prompt.suggestions?.map((suggestion) => ({
      title: suggestion,
      action: suggestion,
    })) || [];

  return (
    <div
      data-testid="suggested-actions"
      className="flex overflow-x-auto pb-2 w-full gap-2 hide-scrollbar"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              sendMessage({ text: suggestedAction.action });
            }}
            className="text-xs whitespace-nowrap border rounded-xl px-3 py-2 flex-shrink-0"
          >
            {suggestedAction.title}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);

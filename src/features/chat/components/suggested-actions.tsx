import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/shared/components/ui';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { generateUUID } from '@/shared/utils';
import { useChatContext } from '../contexts';

function PureSuggestedActions() {
  const { chat } = useChatContext();
  const { sendMessage } = useChat({ chat });
  const { currentCap: cap } = CurrentCapStore();

  const suggestedActions = cap?.core.prompt.suggestions || [];
  // Rows: 2 by default; 3 when there are more than 6 suggestions
  const rowCount = suggestedActions.length > 6 ? 3 : 2;
  // Distribute suggestions across rows (round-robin) so rows are balanced
  const distributedRows = Array.from({ length: rowCount }, () => [] as string[]);
  const sortedSuggestions = [...suggestedActions].sort((a, b) => a.length - b.length);
  sortedSuggestions.forEach((s, i) => {
    distributedRows[i % rowCount].push(s);
  });

  return (
    <div
      data-testid="suggested-actions"
      /*
       * Layout tweaks:
       * - 2–3 rows (3 when > 6) using manual row distribution.
       * - Horizontal scroll when content overflows.
       * - No horizontal gap between suggestions on each row.
       */
      className="w-full overflow-x-auto overflow-y-hidden px-1 hide-scrollbar"
    >
      <div className="flex w-fit flex-col gap-2">
        {distributedRows.map((row, rIdx) => (
          <div key={`suggested-row-${generateUUID()}`} className="inline-flex min-w-max items-center gap-x-2">
            {row.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.04 * index }}
                key={`suggested-action-${suggestedAction}-${generateUUID()}`}
                className="flex-shrink-0"
              >
                <Button
                  variant="ghost"
                  onClick={async () => {
                    sendMessage({ text: suggestedAction });
                  }}
                  aria-label={`Ask: ${suggestedAction}`}
                  className="group rounded-full px-3.5 py-2 text-sm border border-border/60 bg-background/50 hover:bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40 transition shadow-sm hover:shadow"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition" />
                  <span className="whitespace-nowrap text-muted-foreground hover:text-foreground">{suggestedAction}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions);

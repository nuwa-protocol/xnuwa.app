import { TextSelect, X } from 'lucide-react';
import { Badge } from '@/shared/components';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores';

export const InputSelections = () => {
    const { chat } = useChatContext();
    const { chatSessions, removeSelectionFromChatSession } = ChatSessionsStore();
    const selections = chatSessions[chat.id]?.selections;

    return selections && (
        <div className="flex flex-row flex-wrap gap-2 p-2 mx-2">
            {selections?.map((selection) => (
                <Badge
                    key={selection.label}
                    variant="default"
                    className="group cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 flex items-center gap-1 shrink-0"
                    onClick={() =>
                        removeSelectionFromChatSession(chat.id, selection.id)
                    }
                >
                    <TextSelect className="group-hover:hidden" />
                    <X className="hidden group-hover:block" />
                    {selection.label.length > 15 ? `${selection.label.substring(0, 15)}...` : selection.label}
                </Badge>
            ))}
        </div>
    )
};
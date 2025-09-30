import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChatDropdownMenu } from '@/features/chat/components/chat-dropdown-menu';
import { ChatSessionsStore } from '@/features/chat/stores';
import type { ChatSession } from '@/features/chat/types';
import { cn } from '@/shared/utils';
import { useSidebar } from './sidebar';

export const SidebarChatItem = ({
  chat,
  hoveredChatId,
  setHoveredChatId,
}: {
  chat: ChatSession;
  hoveredChatId: string | null;
  setHoveredChatId: (id: string | null) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { chatSessions, deleteSession, updateSession } = ChatSessionsStore();
  const navigate = useNavigate();
  const { open, setStayOpen, setOpen } = useSidebar();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const chatSessionId = searchParams.get('chat_id');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteSession(chat.id);
    if (chat.id === chatSessionId) {
      navigate('/chat');
    }
  };

  const handleRename = (newTitle: string) => {
    updateSession(chat.id, { title: newTitle });
  };

  const handleTogglePin = () => {
    const session = chatSessions[chat.id];
    if (session) {
      updateSession(chat.id, { pinned: !session.pinned });
    }
  };

  const handleMenuOpenChange = (open: boolean) => {
    if (!isDialogOpen) {
      setStayOpen(open);
      setIsHovered(open);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setStayOpen(open);
    setIsHovered(open);
    setIsDialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setOpen(false);
      }, 100);
    }
  };

  const isSelected =
    location.pathname.startsWith('/chat') && chatSessionId === chat.id;

  return (
    <div
      key={chat.id}
      className="relative group items-center justify-start"
      onMouseEnter={() => setHoveredChatId(chat.id)}
      onMouseLeave={() => setHoveredChatId(null)}
    >
      <button
        type="button"
        onClick={() => navigate(`/chat?chat_id=${chat.id}`)}
        className={cn(
          'relative w-full flex items-center gap-2 rounded-lg py-2 pr-2 transition-colors duration-200 text-left group/sidebar',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          isSelected
            ? 'pl-4 text-theme-950 dark:text-theme-100 bg-theme-100 dark:bg-theme-900 hover:bg-theme-200 dark:hover:bg-theme-800'
            : 'pl-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
        )}
        aria-current={isSelected ? 'page' : undefined}
      >
        {/* Left accent bar; absolutely positioned and only present when selected */}
        {isSelected && (
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 w-1 origin-left rounded bg-theme-500"
          />
        )}
        <motion.div
          animate={{
            display: open ? 'block' : 'none',
            opacity: open ? 1 : 0,
          }}
          className="flex-1 min-w-0 group-hover/sidebar:translate-x-1 transition duration-150"
        >
          <div className="text-sm truncate max-w-[200px]">{chat.title}</div>
        </motion.div>
      </button>
      {((open && (hoveredChatId === chat.id || isHovered)) || isDialogOpen) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute right-2 top-1 translate-y-1/2 p-1 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <ChatDropdownMenu
            session={chat}
            onRename={handleRename}
            onTogglePin={handleTogglePin}
            onDelete={handleDelete}
            onMenuOpenChange={handleMenuOpenChange}
            onDialogOpenChange={handleDialogOpenChange}
          />
        </motion.div>
      )}
    </div>
  );
};

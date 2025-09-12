import { motion } from 'framer-motion';
import { Chat } from '@/features/chat/components';

export default function ChatPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full"
    >
      <Chat isReadonly={false} />
    </motion.div>
  );
}

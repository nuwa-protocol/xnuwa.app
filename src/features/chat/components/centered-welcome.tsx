import { motion } from 'framer-motion';
import { Logo } from '@/shared/components/logo';

interface CenteredWelcomeProps {
  children?: React.ReactNode;
}

export function CenteredWelcome({ children }: CenteredWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 px-4">
      <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <Logo size="xl" variant="basic" />
        </motion.div>
        {children}
      </div>
    </div>
  );
}

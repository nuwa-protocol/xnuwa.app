import { motion } from 'framer-motion';

interface CenteredWelcomeProps {
  children?: React.ReactNode;
}

export function CenteredWelcome({ children }: CenteredWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 px-4 z-10">
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Get Started with every AI You Need
          </h1>
          <p className="text-muted-foreground text-center max-w-md">
            Start chatting or explore amazing AI capabilities
          </p>
        </motion.div>
        {children}
      </div>
    </div>
  );
}

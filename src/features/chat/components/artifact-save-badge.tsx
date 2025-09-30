import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { SaveStatus } from '../hooks/use-artifact';

interface ArtifactSaveBadgeProps {
  saveStatus: SaveStatus;
}

export const ArtifactSaveBadge = ({ saveStatus }: ArtifactSaveBadgeProps) => {
  const [showSavingBadge, setShowSavingBadge] = useState(false);
  useEffect(() => {
    if (saveStatus === 'saving') {
      setShowSavingBadge(true);
    }
    if (saveStatus === 'saved') {
      setTimeout(() => {
        setShowSavingBadge(false);
      }, 1000);
    }
  }, [saveStatus]);

  return (
    <div className="pointer-events-none absolute bottom-10 right-10 z-50">
      <AnimatePresence mode="wait">
        {showSavingBadge && (
          <motion.div
            key="saving-badge"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              mass: 0.5,
            }}
            className="pointer-events-none select-none rounded-full bg-black/60 px-3 py-1 text-xs text-white shadow-md backdrop-blur-sm dark:bg-white/10"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="relative inline-block h-1.5 w-1.5">
                {/* Tiny dot loader */}
                <span className="absolute inset-0 animate-ping rounded-full bg-white/80" />
                <span className="absolute inset-0 rounded-full bg-white" />
              </span>
              Saving...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

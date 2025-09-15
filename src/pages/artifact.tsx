import { motion } from 'framer-motion';
import { ArtifactMain } from '@/features/artifacts/components/artifact';

export default function ArtifactPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full"
    >
      <ArtifactMain />
    </motion.div>
  );
}

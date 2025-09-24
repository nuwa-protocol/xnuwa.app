import { motion } from "framer-motion";

export const SidebarLabel = ({ label, open, extraElement }: { label: string, open: boolean, extraElement?: React.ReactNode }) => {
    return (
        <motion.h3
            animate={{
                display: open ? 'flex' : 'none',
                opacity: open ? 1 : 0,
            }}
            className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 px-1 shrink-0 justify-between items-start"
        >
            {label}
            {extraElement}
        </motion.h3>
    );
};
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils';
import { useSidebar } from './sidebar';

export const SecondarySidebarButton = ({
    icon,
    label,
    onClick,
    extraElement,
    targetPath,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    extraElement?: React.ReactNode;
    targetPath: string;
}) => {
    const { open } = useSidebar();
    const location = useLocation();
    // Selected when the current pathname matches or is nested under targetPath
    const isSelected =
        location.pathname === targetPath ||
        location.pathname.startsWith(`${targetPath}/`);
    return (
        <button
            type="button"
            className={cn(
                'relative flex items-center justify-between gap-2 rounded-md py-2 pr-1 transition-colors duration-200 ease-out group/sidebar',
                isSelected
                    ? 'text-theme-950 dark:text-theme-100 bg-theme-100 dark:bg-theme-900 hover:bg-theme-200 dark:hover:bg-theme-800'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                open && isSelected ? 'pl-3' : 'pl-1',
            )}
            aria-current={isSelected ? 'page' : undefined}
            onClick={onClick}
        >
            {/* Absolute left accent bar; only render when selected, animate softly */}
            {isSelected && open && (
                <motion.span
                    aria-hidden="true"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 w-1 origin-left rounded bg-theme-500"
                />
            )}
            <div className="flex items-center gap-2 min-w-0">
                {icon}
                <motion.span
                    animate={{
                        display: open ? 'inline-block' : 'none',
                        opacity: open ? 1 : 0,
                    }}
                    className="text-sm whitespace-pre group-hover/sidebar:translate-x-1 transition duration-150"
                >
                    {label}
                </motion.span>
            </div>
            {extraElement}
        </button>
    );
};

export const PrimarySidebarButton = ({
    icon,
    label,
    onClick,
    extraElement,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    extraElement?: React.ReactNode;
}) => {
    const { open } = useSidebar();
    return (
        <button
            type="button"
            className={cn(
                // layout
                'group/sidebar',
                'w-full inline-flex justify-between items-center gap-2',
                // size and spacing
                'h-10 px-1',
                // appearance
                'rounded-lg text-sm',
                'bg-gradient-to-br from-theme-500 via-theme-500/80 to-theme-500',
                'text-white border border-theme-primary/20',
                'shadow-sm shadow-theme-primary/25',
                // hover
                'hover:from-theme-500/90 hover:to-theme-500/80',
                'hover:shadow-md hover:shadow-theme-500/30',
                // focus
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                // transition
                'transition-colors transition-all duration-200 ease-out',
            )}
            onClick={onClick}
        >
            <div className='flex items-center gap-2'>
                {icon}
                <motion.span
                    animate={{
                        display: open ? 'inline-block' : 'none',
                        opacity: open ? 1 : 0,
                    }}
                    className="text-sm font-medium whitespace-pre group-hover/sidebar:translate-x-1 transition duration-150"
                >
                    {label}
                </motion.span>
            </div>
            {extraElement}
        </button>
    );
};

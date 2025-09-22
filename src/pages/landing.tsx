import { motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { CapStoreLoading } from '@/features/cap-store/components/cap-store-loading';
import { GridPattern } from '@/shared/components/ui/shadcn-io/grid-pattern';
import { cn } from '@/shared/utils';

// Lazy-load the Cap Store home content to avoid blocking route transition
const LazyCapStoreHomeContent = lazy(() =>
    import('@/features/cap-store/components/content-home').then((m) => ({
        default: m.CapStoreHomeContent,
    })),
);

export function LandingPage() {
    const [squares, setSquares] = useState<Array<[number, number]>>([]);
    const [showHome, setShowHome] = useState(false);

    // Generate randomized squares for the grid pattern based on viewport size
    useEffect(() => {
        const CELL_SIZE = 40; // keep in sync with GridPattern props
        const DENSITY = 0.05; // ~5% of cells filled

        const generateSquares = () => {
            const cols = Math.ceil(window.innerWidth / CELL_SIZE);
            const rows = Math.ceil(window.innerHeight / CELL_SIZE);
            const total = cols * rows;

            // Cap the number of squares for performance on very large screens
            const targetCount = Math.min(
                Math.max(Math.floor(total * DENSITY), 16),
                120,
            );

            const picked = new Set<string>();
            while (picked.size < targetCount) {
                const x = Math.floor(Math.random() * cols);
                const y = Math.floor(Math.random() * rows);
                picked.add(`${x},${y}`);
            }
            const coords = Array.from(picked).map((s) => {
                const [x, y] = s.split(',').map((n) => Number(n));
                return [x, y] as [number, number];
            });
            setSquares(coords);
        };

        generateSquares();
        window.addEventListener('resize', generateSquares);
        return () => window.removeEventListener('resize', generateSquares);
    }, []);

    // Defer loading of heavy home content until idle for snappier navigation
    useEffect(() => {
        const schedule = (cb: () => void) => {
            // Prefer requestIdleCallback if available
            if (typeof (window as any).requestIdleCallback === 'function') {
                const id = (window as any).requestIdleCallback(cb, { timeout: 1200 });
                return () => (window as any).cancelIdleCallback?.(id);
            }
            const id = window.setTimeout(cb, 0);
            return () => window.clearTimeout(id);
        };
        const cancel = schedule(() => setShowHome(true));
        return cancel;
    }, []);

    return (
        <div className="flex flex-col relative min-w-0 min-h-screen bg-background  hide-scrollbar">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                strokeDasharray={'2 4'}
                squares={squares}
                className={cn(
                    '[mask-image:linear-gradient(to_bottom,white,transparent,transparent)]',
                    'dark:[mask-image:linear-gradient(to_bottom,black,transparent,transparent)]',
                    'fill-muted/80 dark:fill-muted/20',
                    'z-0',
                )}
            />

            {/* Main Content */}
            <div className="flex flex-col w-full bg-background">
                {/* Welcome Section */}
                <div className="min-h-[40vh] flex flex-col justify-center py-8 mt-10">
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
                        </div>
                    </div>
                </div>

                {/* Cap Store Content Section (lazy) */}
                <div className="flex-1 bg-background max-w-7xl mx-auto min-h-screen">
                    {showHome ? (
                        <Suspense
                            fallback={
                                <div className="p-6">
                                    <CapStoreLoading count={12} />
                                </div>
                            }
                        >
                            <LazyCapStoreHomeContent />
                        </Suspense>
                    ) : (
                        <div className="p-6">
                            <CapStoreLoading count={9} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

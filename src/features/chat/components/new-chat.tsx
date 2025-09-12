import { useEffect, useState } from 'react';
import { CapStoreHomeContent } from '@/features/cap-store/components/content-home';
import { CapStoreHeader } from '@/features/cap-store/components/header';
import { useSidebarOpenState } from '@/features/sidebar/components/app-sidebar';
import { GridPattern } from '@/shared/components/ui/shadcn-io/grid-pattern';
import { cn } from '@/shared/utils';
import { CenteredWelcome } from './centered-welcome';
import { MultimodalInput } from './multimodal-input';

export function NewChat() {
    const [headerOpacity, setHeaderOpacity] = useState(0);
    const [squares, setSquares] = useState<Array<[number, number]>>([]);
    const sidebarOpen = useSidebarOpenState();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Header starts appearing after 150px scroll, fully visible at 300px
            const opacity = Math.min((currentScrollY - 150) / 150, 1);
            setHeaderOpacity(Math.max(opacity, 0));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Generate randomized squares for the grid pattern based on viewport size
    useEffect(() => {
        const CELL_SIZE = 40; // keep in sync with GridPattern props
        const DENSITY = 0.05; // ~5% of cells filled

        const generateSquares = () => {
            const cols = Math.ceil(window.innerWidth / CELL_SIZE);
            const rows = Math.ceil(window.innerHeight / CELL_SIZE);
            const total = cols * rows;

            // Cap the number of squares for performance on very large screens
            const targetCount = Math.min(Math.max(Math.floor(total * DENSITY), 16), 120);

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

    return (
        <div className="flex flex-col relative min-w-0 min-h-screen bg-background  hide-scrollbar">
            {/* Grid Pattern Background */}
            <GridPattern
                width={40}
                height={40}
                strokeDasharray={"2 4"}
                squares={squares}
                className={cn(
                    "[mask-image:linear-gradient(to_bottom,white,transparent,transparent)]",
                    "dark:[mask-image:linear-gradient(to_bottom,black,transparent,transparent)]",
                    "fill-muted/80 dark:fill-muted/20",
                    "z-0"
                )}
            />

            {/* Sticky Header - appears on scroll and respects sidebar */}
            <CapStoreHeader style={{
                opacity: headerOpacity,
                zIndex: 20,
            }} />
            {/* Main Content */}
            <div className="flex flex-col w-full bg-background">
                {/* Welcome Section with Input - reduced height */}
                <div className="min-h-[50vh] flex flex-col justify-end py-8 mb-20">
                    <CenteredWelcome>
                        <div className="w-full max-w-4xl space-y-6">
                            <div className="px-4">
                                <MultimodalInput />
                            </div>
                        </div>
                    </CenteredWelcome>
                </div>

                {/* Cap Store Content Section */}
                <div className="flex-1 bg-background max-w-7xl mx-auto min-h-screen">
                    <CapStoreHomeContent />
                </div>
            </div>
        </div>
    );
}

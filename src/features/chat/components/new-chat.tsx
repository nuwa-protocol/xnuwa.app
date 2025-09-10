import { useEffect, useState } from 'react';
import { CapStoreContent } from '@/features/cap-store/components/content';
import { CapStoreHeader } from '@/features/cap-store/components/header';
import { CapStoreProvider } from '@/features/cap-store/context';
import { useSidebarOpenState } from '@/features/sidebar/components/app-sidebar';
import { GridPattern } from '@/shared/components/ui/shadcn-io/grid-pattern';
import { cn } from '@/shared/utils';
import { CenteredWelcome } from './centered-welcome';
import { MultimodalInput } from './multimodal-input';

export function NewChat() {
    const [headerOpacity, setHeaderOpacity] = useState(0);
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

    return (
        <CapStoreProvider>
            <div className="flex flex-col relative min-w-0 min-h-screen bg-background  hide-scrollbar">
                {/* Grid Pattern Background */}
                <GridPattern
                    width={40}
                    height={40}
                    x={-1}
                    y={-1}
                    strokeDasharray={"4 2"}
                    className={cn(
                        "[mask-image:linear-gradient(to_bottom,white,transparent,transparent)] "
                    )}
                />

                {/* Sticky Header - appears on scroll and respects sidebar */}
                <CapStoreHeader style={{
                    opacity: headerOpacity
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
                        <CapStoreContent />
                    </div>
                </div>
            </div>
        </CapStoreProvider>
    );
}

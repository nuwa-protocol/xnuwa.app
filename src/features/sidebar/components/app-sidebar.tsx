import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useSidebarFloating } from '@/features/sidebar/hooks/use-sidebar-floating';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { MainContent } from './main-content';

// Context for managing sidebar hover state
const AppSidebarContext = createContext<{
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  stayHovering: (stay: boolean) => void;
  closeSidebar: () => void;
} | null>(null);

export const useAppSidebar = () => {
  const context = useContext(AppSidebarContext);

  if (!context) {
    throw new Error(
      'useAppSidebar must be used within AppSidebarProvider',
    );
  }
  return context;
};

interface SidebarLayoutProps {
  children: ReactNode;
}

// Memoize the content wrapper to prevent unnecessary re-renders
const ContentWrapper = memo(
  ({ children, isFloating }: { children: ReactNode; isFloating: boolean }) => {
    return (
      <SidebarInset
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out', // Add smooth transition
          // Enhanced animation for content positioning
          isFloating
            ? 'w-full ml-0'
            : // Full width in floating mode
              '', // Normal layout in pinned mode
        )}
      >
        <div className={'h-full transition-all duration-300 ease-in-out'}>
          {children}
        </div>
      </SidebarInset>
    );
  },
);
ContentWrapper.displayName = 'ContentWrapper';

function SidebarLayoutContent({ children }: SidebarLayoutProps) {
  const { collapsed: sidebarCollapsed, mode: sidebarMode } =
    useSidebarFloating();

  // Get hover state from context (handle null gracefully)
  const floatingContext = useContext(AppSidebarContext);
  const isHovering = floatingContext?.isHovering ?? false;

  // Calculate if sidebar should be open
  const shouldBeOpen =
    sidebarMode === 'floating' ? isHovering : !sidebarCollapsed;
  const isFloating = sidebarMode === 'floating';

  // Memoize the content wrapper to prevent re-renders when only positioning changes
  const contentElement = useMemo(() => {
    return <ContentWrapper isFloating={isFloating}>{children}</ContentWrapper>;
  }, [children, isFloating]);

  return (
    <SidebarProvider defaultOpen={shouldBeOpen} open={shouldBeOpen}>
      {/* Always use the same DOM structure, but with different positioning */}
      <div className="relative flex w-full min-h-screen">
        {/* Sidebar container with smooth transition animation */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out', // Smooth transition for position changes
            isFloating
              ? 'fixed inset-y-0 left-0 z-50 w-0' // No width, positioned absolutely
              : 'relative w-64', // Normal layout flow
          )}
        >
          <MainContent />
        </div>

        {/* Main content area - memoized to prevent re-renders */}
        {contentElement}
      </div>
    </SidebarProvider>
  );
}

export function SidebarLayout({
  children,
}: SidebarLayoutProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isStaying, setIsStaying] = useState(false);
  const { mode: sidebarMode } = useSidebarFloating();

  // stayHovering: lock or unlock the hover state
  const stayHovering = useCallback((stay: boolean) => {
    setIsStaying(stay);
    if (stay) setIsHovering(true);
  }, []);

  // Only allow setIsHovering if not locked
  const stableSetIsHovering = useCallback(
    (hovering: boolean) => {
      if (!isStaying) setIsHovering(hovering);
    },
    [isStaying],
  );

  // Force close the sidebar regardless of staying state
  const closeSidebar = useCallback(() => {
    setIsStaying(false);
    setIsHovering(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      isHovering,
      setIsHovering: stableSetIsHovering,
      stayHovering,
      closeSidebar,
    }),
    [isHovering, stableSetIsHovering, stayHovering, closeSidebar],
  );

  return (
    <AppSidebarContext.Provider value={contextValue}>
      <div className="relative size-full">
        <SidebarLayoutContent>{children}</SidebarLayoutContent>

        {/* Hover trigger area for floating mode */}
        {sidebarMode === 'floating' && (
          <div
            aria-hidden="true"
            className="fixed left-0 top-0 w-10 h-full z-40 bg-transparent pointer-events-auto"
            onMouseEnter={() => stableSetIsHovering(true)}
            onMouseLeave={() => stableSetIsHovering(false)}
          />
        )}
      </div>
    </AppSidebarContext.Provider>
  );
}

// Hook to get the computed open state based on mode (for external use)
export const useSidebarOpenState = () => {
  const { collapsed: sidebarCollapsed, mode: sidebarMode } =
    useSidebarFloating();

  // Get hover state from context (handle null gracefully)
  const floatingContext = useContext(AppSidebarContext);
  const isHovering = floatingContext?.isHovering ?? false;

  // In floating mode, use hover state; in pinned mode, respect the collapsed state
  return sidebarMode === 'floating' ? isHovering : !sidebarCollapsed;
};

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    updateLoadingProgress?: (percentage: number, text?: string) => void;
    hideLoadingScreen?: () => void;
  }
}

// Track the current progress globally to prevent regression
let globalProgress = 0;
let isLoadingComplete = false;

/**
 * Update loading progress (only allow forward progress)
 */
function updateLoadingProgress(percentage: number, text?: string) {
  if (typeof window !== 'undefined' && window.updateLoadingProgress) {
    // Only update if the new percentage is higher than current
    if (percentage > globalProgress) {
      globalProgress = percentage;
      window.updateLoadingProgress(percentage, text);
    }
  }
}

/**
 * Hide the HTML inline loading interface
 */
function hideInitialLoading() {
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement && !loadingElement.classList.contains('hidden')) {
    isLoadingComplete = true;
    // Use the global hide function if available for smooth animation
    if (typeof window !== 'undefined' && window.hideLoadingScreen) {
      window.hideLoadingScreen();
    } else {
      loadingElement.classList.add('hidden');
      // Remove the element after the animation ends, release memory
      setTimeout(() => loadingElement.remove(), 300);
    }
  }
}

/**
 * Hook to hide initial loading screen immediately
 * Use this in error pages or anywhere you need to force hide the loading screen
 */
export function useHideInitialLoading() {
  useEffect(() => {
    hideInitialLoading();
  }, []);
}

/**
 * Check component is ready
 * - Check React App is ready
 * - Check if the critical components are rendered
 * - Remove the HTML loading interface after completion
 * - Reports progress during different loading stages
 */
export function useAutoLoadingDetection() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Skip if loading is already complete
    if (isLoadingComplete) {
      return;
    }

    // Initial progress when hook starts
    updateLoadingProgress(20, 'Initializing React...');

    // Check React App is ready
    const checkAppReady = () => {
      // Skip if loading is already complete
      if (isLoadingComplete) {
        return;
      }

      // Check if the root element exists
      const rootElement = document.getElementById('root');
      const hasAppContent = rootElement && rootElement.children.length > 0;

      if (hasAppContent) {
        // Update progress when app content is detected
        updateLoadingProgress(60, 'Loading components...');

        // Give a minimum delay to ensure rendering is complete
        setTimeout(() => {
          if (!isLoadingComplete) {
            updateLoadingProgress(90, 'Finalizing...');

            // Final progress before hiding
            setTimeout(() => {
              if (!isLoadingComplete) {
                updateLoadingProgress(100, 'Ready!');
                setIsAppReady(true);

                // Hide after showing 100% briefly
                setTimeout(() => {
                  hideInitialLoading();
                }, 200);
              }
            }, 200);
          }
        }, 300); // Reduced from 500ms for better UX
      }
    };

    // Check immediately
    checkAppReady();

    // If the app is not ready, use MutationObserver to listen for DOM changes
    if (!isAppReady && !isLoadingComplete) {
      updateLoadingProgress(40, 'Waiting for content...');

      const observer = new MutationObserver(checkAppReady);
      const rootElement = document.getElementById('root');

      if (rootElement) {
        observer.observe(rootElement, {
          childList: true,
          subtree: true,
        });
      }

      // Fallback: wait for 5 seconds
      const maxWaitTimer = setTimeout(() => {
        if (!isLoadingComplete) {
          updateLoadingProgress(100, 'Taking longer than expected...');
          setIsAppReady(true);
          setTimeout(() => {
            hideInitialLoading();
          }, 200);
        }
        observer.disconnect();
      }, 5000);

      return () => {
        observer.disconnect();
        clearTimeout(maxWaitTimer);
      };
    }
  }, [isAppReady]);
}

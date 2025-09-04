import { useEffect, useState } from 'react';

/**
 * Check component is ready
 * - Check React App is ready
 * - Check if the critical components are rendered
 * - Remove the HTML loading interface after completion
 */
export function useAutoLoadingDetection() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Check React App is ready
    const checkAppReady = () => {
      // Check if the root element exists
      const rootElement = document.getElementById('root');
      const hasAppContent = rootElement && rootElement.children.length > 0;

      if (hasAppContent) {
        // Give a minimum delay to ensure rendering is complete
        setTimeout(() => {
          setIsAppReady(true);
          hideInitialLoading();
        }, 500); // Minimum delay to ensure visual effect
      }
    };

    // Check immediately
    checkAppReady();

    // If the app is not ready, use MutationObserver to listen for DOM changes
    if (!isAppReady) {
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
        setIsAppReady(true);
        hideInitialLoading();
        observer.disconnect();
      }, 5000);

      return () => {
        observer.disconnect();
        clearTimeout(maxWaitTimer);
      };
    }
  }, [isAppReady]);
}

/**
 * Hide the HTML inline loading interface
 */
function hideInitialLoading() {
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement) {
    loadingElement.classList.add('hidden');

    // Remove the element after the animation ends, release memory
    setTimeout(() => {
      loadingElement.remove();
    }, 300); // Corresponding CSS transition duration
  }
}

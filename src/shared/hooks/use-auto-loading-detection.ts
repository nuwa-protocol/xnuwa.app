import { useEffect } from 'react';
import { rehydrationTracker } from './use-rehydration';

declare global {
  interface Window {
    updateLoadingProgress?: (percentage: number, text?: string) => void;
    hideLoadingScreen?: () => void;
  }
}

// Track progress animation state globally
let targetProgress = 0;
let displayedProgress = 0;
let progressAnimationFrame: number | null = null;
let latestStatusText: string | undefined;
let isLoadingComplete = false;

const PROGRESS_EPSILON = 0.2;
const PROGRESS_EASING = 0.08;
const MIN_PROGRESS_STEP = 0.06;

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, value));
}

function cancelProgressAnimation() {
  if (progressAnimationFrame !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(progressAnimationFrame);
  }
  progressAnimationFrame = null;
}

function applyProgress(value: number) {
  displayedProgress = value;
  if (typeof window !== 'undefined' && window.updateLoadingProgress) {
    window.updateLoadingProgress(value, latestStatusText);
  }
}

function animateProgress() {
  const diff = targetProgress - displayedProgress;
  if (diff <= PROGRESS_EPSILON) {
    applyProgress(targetProgress);
    progressAnimationFrame = null;
    return;
  }

  const step = Math.max(diff * PROGRESS_EASING, MIN_PROGRESS_STEP);
  const nextValue = clampProgress(
    Math.min(targetProgress, displayedProgress + step),
  );
  applyProgress(nextValue);
  if (typeof window !== 'undefined') {
    progressAnimationFrame = window.requestAnimationFrame(animateProgress);
  }
}

function scheduleProgressAnimation() {
  if (progressAnimationFrame !== null || typeof window === 'undefined') {
    return;
  }
  progressAnimationFrame = window.requestAnimationFrame(animateProgress);
}

/**
 * Update loading progress (only allow forward progress)
 */
function updateLoadingProgress(percentage: number, text?: string) {
  const nextTarget = clampProgress(percentage);

  if (text) {
    latestStatusText = text;

    if (
      typeof window !== 'undefined' &&
      window.updateLoadingProgress &&
      progressAnimationFrame === null
    ) {
      window.updateLoadingProgress(displayedProgress, latestStatusText);
    }
  }

  if (nextTarget > targetProgress) {
    targetProgress = nextTarget;
    if (typeof window === 'undefined') {
      displayedProgress = targetProgress;
    } else {
      scheduleProgressAnimation();
    }
  } else if (
    progressAnimationFrame === null &&
    displayedProgress < targetProgress
  ) {
    scheduleProgressAnimation();
  }
}

/**
 * Hide the HTML inline loading interface
 */
function hideInitialLoading() {
  const loadingElement = document.getElementById('initial-loading');
  if (loadingElement && !loadingElement.classList.contains('hidden')) {
    isLoadingComplete = true;
    latestStatusText = latestStatusText ?? 'Ready!';
    targetProgress = 100;
    cancelProgressAnimation();
    applyProgress(100);
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
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isLoadingComplete) {
      return;
    }

    updateLoadingProgress(12, 'Initializing Nuwa AI...');

    const cleanupFns: Array<() => void> = [];
    let hasAppContent = false;
    let isRehydrationComplete = false;
    let isFinalizing = false;
    let mockProgressInterval: number | null = null;
    let mockProgressCeiling = 0;

    const registerTimeout = (handler: () => void, delay: number) => {
      const id = window.setTimeout(handler, delay);
      cleanupFns.push(() => window.clearTimeout(id));
      return id;
    };

    const stopMockProgress = () => {
      if (mockProgressInterval !== null) {
        window.clearInterval(mockProgressInterval);
        mockProgressInterval = null;
      }
    };

    const pumpMockProgress = () => {
      if (
        mockProgressInterval === null ||
        isLoadingComplete ||
        isFinalizing ||
        targetProgress >= mockProgressCeiling - 0.1
      ) {
        stopMockProgress();
        return;
      }

      if (mockProgressCeiling < 88) {
        mockProgressCeiling = Math.min(
          88,
          Math.max(mockProgressCeiling, targetProgress + 0.35),
        );
      }

      const remaining = mockProgressCeiling - targetProgress;
      const increment = Math.max(0.18, Math.min(remaining * 0.22, 1.5));
      const nextTarget = Math.min(
        mockProgressCeiling,
        targetProgress + increment,
      );

      if (nextTarget > targetProgress) {
        updateLoadingProgress(nextTarget);
      }

      if (nextTarget >= mockProgressCeiling) {
        stopMockProgress();
      }
    };

    const startMockProgress = () => {
      if (mockProgressInterval !== null) {
        return;
      }
      mockProgressInterval = window.setInterval(pumpMockProgress, 320);
      cleanupFns.push(stopMockProgress);
      pumpMockProgress();
    };

    const ensureMockProgress = (ceiling: number) => {
      const sanitizedCeiling = Math.min(88, Math.max(ceiling, targetProgress));
      if (sanitizedCeiling <= mockProgressCeiling) {
        return;
      }
      mockProgressCeiling = sanitizedCeiling;
      if (
        !isLoadingComplete &&
        !isFinalizing &&
        targetProgress < mockProgressCeiling
      ) {
        startMockProgress();
      }
    };

    ensureMockProgress(32);

    const finalizeLoading = (message = 'Ready!') => {
      if (isFinalizing || isLoadingComplete) {
        return;
      }
      isFinalizing = true;

      stopMockProgress();

      updateLoadingProgress(
        Math.max(targetProgress, 90),
        'Finalizing setup...',
      );

      registerTimeout(() => {
        if (isLoadingComplete) {
          return;
        }

        updateLoadingProgress(100, message);

        registerTimeout(() => {
          hideInitialLoading();
        }, 260);
      }, 280);
    };

    const tryFinishLoading = () => {
      if (hasAppContent && isRehydrationComplete) {
        finalizeLoading();
      }
    };

    const updateRehydrationStatus = () => {
      if (isLoadingComplete) {
        return;
      }

      const status = rehydrationTracker.getStatus();
      const storeNames = Object.keys(status);

      if (storeNames.length === 0) {
        isRehydrationComplete = true;
        stopMockProgress();
        tryFinishLoading();
        return;
      }

      const totalStores = storeNames.length;
      const completedStores = storeNames.filter((name) => status[name]).length;
      const ratio = completedStores / totalStores;

      const progressValue = 22 + ratio * 33; // Map rehydration progress to ~20%-55%
      const percentageText = Math.round(ratio * 100);
      const message =
        completedStores < totalStores ? `Restoring data...` : 'Data restored';

      updateLoadingProgress(progressValue, message);

      if (completedStores === totalStores) {
        isRehydrationComplete = true;
        stopMockProgress();
        tryFinishLoading();
      } else {
        ensureMockProgress(Math.min(55, progressValue + 6));
      }
    };

    updateRehydrationStatus();
    cleanupFns.push(rehydrationTracker.subscribe(updateRehydrationStatus));

    const checkAppReady = () => {
      if (isLoadingComplete || hasAppContent) {
        return;
      }

      const rootElement = document.getElementById('root');
      const rootHasContent = Boolean(
        rootElement && rootElement.children.length,
      );

      if (rootHasContent) {
        hasAppContent = true;
        updateLoadingProgress(
          Math.max(targetProgress, 65),
          'Preparing interface...',
        );

        if (!isRehydrationComplete) {
          ensureMockProgress(78);
        }

        registerTimeout(() => {
          tryFinishLoading();
        }, 340);
      }
    };

    checkAppReady();

    const observer = new MutationObserver(checkAppReady);
    const rootElement = document.getElementById('root');

    if (rootElement) {
      observer.observe(rootElement, {
        childList: true,
        subtree: true,
      });
      cleanupFns.push(() => observer.disconnect());
    }

    if (!hasAppContent) {
      updateLoadingProgress(30, 'Waiting for interface...');
      ensureMockProgress(45);
    }

    registerTimeout(() => {
      if (!isLoadingComplete) {
        finalizeLoading('Nuwa AI is ready');
      }
    }, 7000);

    return () => {
      cleanupFns.forEach((cleanup) => {
        cleanup();
      });
    };
  }, []);
}

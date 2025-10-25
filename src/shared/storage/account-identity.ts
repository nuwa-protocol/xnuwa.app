import { rehydrationTracker } from '../hooks/use-rehydration';

type AccountAddressResolver =
  | (() => string | null)
  | (() => Promise<string | null>);

let resolver: AccountAddressResolver = () => null;

/**
 * Registers a resolver that returns the address of the currently
 * active account. The resolver is invoked every time a storage
 * helper needs the scoped identity, so it can read directly from
 * the latest store state.
 */
export function setAccountAddressResolver(
  nextResolver: AccountAddressResolver,
) {
  resolver = nextResolver;
}

// Lazily-shared promise so concurrent callers wait for the same signal
let waitAuthPromise: Promise<void> | null = null;

/**
 * Wait until the account store finishes rehydration so that
 * the resolver can return the actual current address.
 * Times out to avoid deadlocks if user is logged out or on errors.
 */
async function waitForAuthRehydration(timeoutMs = 2000): Promise<void> {
  // If we're not in a browser, do nothing
  if (typeof window === 'undefined') return;

  if (rehydrationTracker.isAuthRehydrated()) return;

  if (!waitAuthPromise) {
    waitAuthPromise = new Promise<void>((resolve) => {
      // Fallback timeout so we never block forever
      const timer = setTimeout(() => {
        unsubscribe();
        resolve();
      }, timeoutMs);

      const unsubscribe = rehydrationTracker.subscribe(() => {
        if (rehydrationTracker.isAuthRehydrated()) {
          clearTimeout(timer);
          unsubscribe();
          resolve();
        }
      });
    }).finally(() => {
      waitAuthPromise = null;
    });
  }

  await waitAuthPromise;
}

export async function getCurrentAccountAddress(): Promise<string | null> {
  try {
    // Try immediately (works after initial load or when switching accounts)
    let result = await resolver();
    if (result) return result;

    // On first app load, other stores may hydrate before auth store.
    // Wait briefly for the account store to rehydrate, then try again.
    await waitForAuthRehydration();

    result = await resolver();
    return result || null;
  } catch (error) {
    console.error('Failed to resolve current account address:', error);
    return null;
  }
}

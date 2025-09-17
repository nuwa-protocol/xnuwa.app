import * as Sentry from '@sentry/react';
import { sentryConfig } from '../config/sentry';
import { CurrentCapStore } from '../stores/current-cap-store';
import { NuwaIdentityKit } from './identity-kit';

export function initSentry() {
  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend: async (event) => {
      // Don't send in development mode unless explicitly enabled

      const isSentryDebugEnabled = import.meta.env.VITE_SENTRY_DEBUG === 'true';
      if (import.meta.env.MODE === 'development' && !isSentryDebugEnabled) {
        return null;
      }

      // add version info to event
      event.tags = {
        ...event.tags,
        app_version: __APP_VERSION__,
      };

      // add current cap information to event
      const currentCap = CurrentCapStore.getState().currentCap;
      if (currentCap) {
        event.tags = {
          ...event.tags,
          current_cap: currentCap.id,
        };
        event.contexts = {
          ...event.contexts,
          cap: currentCap,
        };
      }

      // Add DID to event
      try {
        const did = await NuwaIdentityKit().getDid();
        const keyIds = await (
          await NuwaIdentityKit().getKeyManager()
        ).listKeyIds();
        if (did && keyIds) {
          event.user = {
            ...event.user,
            id: did,
            key_ids: keyIds,
          };
          event.tags = {
            ...event.tags,
            user_did: did,
          };
        }
      } catch (error) {
        console.error('beforeSend failed:', error);
        return event;
      }

      return event;
    },
  });
}

export { Sentry };

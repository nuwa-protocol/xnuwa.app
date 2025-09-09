export interface URLValidationResult {
  isValid: boolean;
  error?: string;
  canBeEmbedded: boolean;
}

export interface URLValidationOptions {
  timeout?: number;
  allowedOrigins?: string[];
}

export async function validateURL(
  url: string,
  options: URLValidationOptions = {},
): Promise<URLValidationResult> {
  const { timeout = 10000, allowedOrigins } = options;

  try {
    // Basic URL validation
    const urlObj = new URL(url);

    // Check if protocol is allowed
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS protocols are allowed',
        canBeEmbedded: false,
      };
    }

    // Check allowed origins if specified
    if (allowedOrigins && !allowedOrigins.includes(urlObj.origin)) {
      return {
        isValid: false,
        error: `Origin ${urlObj.origin} is not in allowed origins list`,
        canBeEmbedded: false,
      };
    }

    // Test if URL can be reached and get headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // Use no-cors to avoid CORS issues for basic reachability
      });

      clearTimeout(timeoutId);

      // If we get here with no-cors, the URL is reachable
      // Now try with cors to get headers for iframe embedding checks
      let canBeEmbedded = true;
      let embedError = '';

      try {
        const corsResponse = await fetch(url, {
          method: 'HEAD',
          mode: 'cors',
        });

        // Check X-Frame-Options header
        const xFrameOptions = corsResponse.headers.get('x-frame-options');
        if (xFrameOptions) {
          const xFrameValue = xFrameOptions.toLowerCase();
          if (xFrameValue === 'deny' || xFrameValue === 'sameorigin') {
            canBeEmbedded = false;
            embedError = `X-Frame-Options header prevents embedding: ${xFrameOptions}`;
          }
        }

        // Check Content-Security-Policy header
        const csp = corsResponse.headers.get('content-security-policy');
        if (csp && csp.includes('frame-ancestors')) {
          const frameAncestors = csp.match(/frame-ancestors\s+([^;]+)/i);
          if (frameAncestors) {
            const allowedAncestors = frameAncestors[1].trim();
            if (allowedAncestors === "'none'") {
              canBeEmbedded = false;
              embedError =
                'Content-Security-Policy frame-ancestors prevents embedding';
            }
          }
        }
      } catch (corsError) {
        // CORS error doesn't necessarily mean the URL can't be embedded
        // Many sites block CORS but allow iframe embedding
        console.warn(
          'CORS check failed, but URL might still be embeddable:',
          corsError,
        );
      }

      return {
        isValid: true,
        error: embedError || undefined,
        canBeEmbedded,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          isValid: false,
          error: `URL validation timed out after ${timeout}ms`,
          canBeEmbedded: false,
        };
      }

      return {
        isValid: false,
        error: `Failed to reach URL: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        canBeEmbedded: false,
      };
    }
  } catch (urlError) {
    return {
      isValid: false,
      error: `Invalid URL format: ${urlError instanceof Error ? urlError.message : String(urlError)}`,
      canBeEmbedded: false,
    };
  }
}

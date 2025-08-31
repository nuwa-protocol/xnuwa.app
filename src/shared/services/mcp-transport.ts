import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { DIDAuth } from '@nuwa-ai/identity-kit';
import { IdentityKitWeb } from '@nuwa-ai/identity-kit-web';
import { PostMessageMCPTransport } from '@nuwa-ai/ui-kit';

/**
 * Utility: build a DIDAuth header signer – returns a function that signs arbitrary payloads.
 */
export async function createDidAuthSigner(baseUrl: string) {
  const sdk = await IdentityKitWeb.init({ storage: 'local' });
  return async (body: unknown): Promise<string> => {
    const payload = {
      operation: 'mcp-json-rpc',
      params: { body, url: baseUrl },
    } as const;
    const sig = await sdk.sign(payload);
    return DIDAuth.v1.toAuthorizationHeader(sig);
  };
}

type Signer = (body: unknown) => Promise<string>;

/**
 * Transport with per-request DIDAuth header (HTTP streaming).
 */
export class SignedStreamableHTTPClientTransport extends StreamableHTTPClientTransport {
  private signer: Signer;
  constructor(url: URL, signer: Signer, initialHeader: string) {
    super(url, {
      requestInit: { headers: { Authorization: initialHeader } },
    } as any);
    this.signer = signer;
  }
  async send(message: any): Promise<void> {
    // Inject new header each request
    const auth = await this.signer(message);
    (this as any).requestInit = (this as any).requestInit || {};
    (this as any).requestInit.headers = {
      ...(this as any).requestInit.headers,
      Authorization: auth,
    };
    return super.send(message);
  }
}

/**
 * Transport with per-request DIDAuth header (PostMessage).
 * TODO: DID Auth is not supported yet
 */
export class SignedPostMessageMCPTransport extends PostMessageMCPTransport {
  private signer: Signer;

  constructor(
    options: {
      targetWindow: Window;
      targetOrigin?: string;
      allowedOrigins?: string[];
      debug?: boolean;
      timeout?: number;
    },
    signer: Signer,
    initialHeader: string,
  ) {
    super({
      targetWindow: options.targetWindow,
      targetOrigin: options.targetOrigin,
      allowedOrigins: options.allowedOrigins,
      debug: options.debug,
      timeout: options.timeout,
    });
    this.signer = signer;
    // Set initial headers after construction
    (this as any).headers = { Authorization: initialHeader };
  }

  async send(message: any): Promise<void> {
    // Inject new header each request
    const auth = await this.signer(message);
    (this as any).headers = {
      ...(this as any).headers,
      Authorization: auth,
    };
    return super.send(message);
  }
}

/**
 * Factory function to create transport based on type.
 */
export async function createTransport(
  transportType: 'httpStream' | 'postMessage',
  url: string,
  signer: Signer,
  initialHeader: string,
  postMessageOptions?: {
    targetWindow: Window;
    targetOrigin?: string;
    allowedOrigins?: string[];
    debug?: boolean;
    timeout?: number;
  },
): Promise<
  SignedStreamableHTTPClientTransport | SignedPostMessageMCPTransport
> {
  if (transportType === 'postMessage') {
    if (!postMessageOptions) {
      throw new Error('PostMessage transport requires postMessageOptions');
    }
    return new SignedPostMessageMCPTransport(
      postMessageOptions,
      signer,
      initialHeader,
    );
  }
  return new SignedStreamableHTTPClientTransport(
    new URL(url),
    signer,
    initialHeader,
  );
}

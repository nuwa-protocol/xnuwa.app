import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { experimental_createMCPClient as createMCPClient } from 'ai';
import { privateKeyToAccount } from 'viem/accounts';
import { withPayment } from './x402-mcp';

// address 0x87fa41edd43ce8374c47059ae613968a2eb971af
const privateKey =
  '0xe53bdfab2c936c9461f5a27449d12122441e422ffc88ad6dd8f62530e5853068';

const account = privateKeyToAccount(privateKey);

export const createX402MCPClient = async (url: string) => {
  return await createMCPClient({
    transport: new StreamableHTTPClientTransport(new URL(url)),
  }).then((client) =>
    withPayment(client, {
      account: account,
      network: 'base-sepolia',
    }),
  );
};

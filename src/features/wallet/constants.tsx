export const networks = [
  {
    value: 'ethereum' as const,
    label: 'Ethereum',
  },
  {
    value: 'arbitrum' as const,
    label: 'Arbitrum',
  },
  {
    value: 'base' as const,
    label: 'Base',
  },
  {
    value: 'polygon' as const,
    label: 'Polygon',
  },
  {
    value: 'bsc' as const,
    label: 'Binance Smart Chain',
  },
];

export const assets = [
  {
    value: 'usdt' as const,
    label: 'USDT',
  },
  {
    value: 'usdc' as const,
    label: 'USDC',
  },
];

export const assetMap = {
  usdt: {
    ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    base: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    polygon: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    bsc: '0x55d398326f99059fF775485246999027B3197955',
  },
  usdc: {
    ethereum: '0xA0b86a33E6441b29a3E0fD77cEE19BC65e30F592',
    arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    bsc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
};

export const networkMap = {
  ethereum: 'eip155:1',
  arbitrum: 'eip155:42161',
  base: 'eip155:8453',
  polygon: 'eip155:137',
  bsc: 'eip155:56',
};

export const recipientMap = {
  ethereum: '0xb481913003fa9c156144e2c7322976c489e1eeb3',
  arbitrum: '0xb481913003fa9c156144e2c7322976c489e1eeb3',
  base: '0xb481913003fa9c156144e2c7322976c489e1eeb3',
  polygon: '0xb481913003fa9c156144e2c7322976c489e1eeb3',
  bsc: '0xb481913003fa9c156144e2c7322976c489e1eeb3',
};

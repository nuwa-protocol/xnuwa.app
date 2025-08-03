
export interface BalanceData {
  nuwaTokens: number;
  usdRate: number; // USD value per NUWA token
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'top_up';
  amount: number; // Always in NUWA tokens
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TopUpRequest {
  amount: number; // Amount in NUWA tokens to purchase
  paymentMethod: string;
}

export const accountApi = {
  async getBalance(): Promise<BalanceData> {
    // For now, always return mock data since API endpoints don't exist yet
    // This can be replaced with real API calls when backend is ready
    console.log('Using mock balance data');
    return {
      nuwaTokens: 1250,
      usdRate: 0.02, // $0.02 per NUWA token
    };
  },

  async getTransactions(): Promise<Transaction[]> {
    // For now, always return mock data since API endpoints don't exist yet
    // This can be replaced with real API calls when backend is ready
    console.log('Using mock transaction data');
    return [
      {
        id: '1',
        type: 'top_up',
        amount: 2500,
        description: 'Purchased $2,500 NUWA ($50.00)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: '2',
        type: 'debit',
        amount: 763,
        description: 'Chat session with GPT-4',
        timestamp: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'completed',
      },
      {
        id: '3',
        type: 'credit',
        amount: 500,
        description: 'Weekly $NUWA bonus',
        timestamp: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'completed',
      },
      {
        id: '4',
        type: 'debit',
        amount: 438,
        description: 'Image generation service',
        timestamp: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        status: 'completed',
      },
    ];
  },

  async topUpBalance(
    request: TopUpRequest,
  ): Promise<{ success: boolean; transactionId?: string }> {
    // For now, simulate successful top-up
    // This can be replaced with real API calls when backend is ready
    console.log('Simulating top-up:', request);
    return {
      success: true,
      transactionId: `txn_${Date.now()}`,
    };
  },
};

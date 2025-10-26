// Local X402 transaction store that only keeps the official payment requirement
// and the decoded payment response. We use clientTxRef as the primary key.
import Dexie, { type Table } from 'dexie';
import type { PaymentRequirements as X402PaymentRequirement } from 'x402/types';
import type { decodeXPaymentResponse } from 'x402/shared';

const hasIndexedDB =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

export type X402PaymentResponse = ReturnType<typeof decodeXPaymentResponse>;

export interface X402TransactionRecord {
  clientTxRef: string;
  requirement: X402PaymentRequirement;
  response?: X402PaymentResponse;
}

export interface X402TransactionStore {
  create(record: X402TransactionRecord): Promise<void>;
  get(id: string): Promise<X402TransactionRecord | null>;
  update(
    id: string,
    patch: Partial<X402TransactionRecord>,
  ): Promise<void>;
}

// In-memory store with simple pruning (by insertion order)
class MemoryStore implements X402TransactionStore {
  private map = new Map<string, X402TransactionRecord>();
  constructor(private maxRecords: number) {}

  async create(record: X402TransactionRecord): Promise<void> {
    this.map.set(record.clientTxRef, record);
    this.prune();
  }

  async get(id: string): Promise<X402TransactionRecord | null> {
    return this.map.get(id) ?? null;
  }

  async update(
    id: string,
    patch: Partial<X402TransactionRecord>,
  ): Promise<void> {
    const existing = this.map.get(id);
    if (!existing) return;
    this.map.set(id, { ...existing, ...patch });
  }

  private prune() {
    const overflow = this.map.size - this.maxRecords;
    if (overflow <= 0) return;
    const keys = Array.from(this.map.keys()).slice(0, overflow);
    for (const key of keys) this.map.delete(key);
  }
}

// IndexedDB store via Dexie, kept separate from the app's main DB
class X402TxDB extends Dexie {
  txs!: Table<X402TransactionRecord, string>;
  constructor() {
    super('NuwaX402TxDB');
    this.version(2).stores({
      // Primary key: clientTxRef
      txs: 'clientTxRef',
    });
  }
}

class IndexedDBStore implements X402TransactionStore {
  private db = new X402TxDB();
  constructor(private maxRecords: number) {}

  async create(record: X402TransactionRecord): Promise<void> {
    await this.db.txs.put(record);
    await this.prune();
  }

  async get(id: string): Promise<X402TransactionRecord | null> {
    return (await this.db.txs.get(id)) ?? null;
  }

  async update(
    id: string,
    patch: Partial<X402TransactionRecord>,
  ): Promise<void> {
    await this.db.txs.update(id, patch);
  }

  private async prune() {
    const count = await this.db.txs.count();
    if (count <= this.maxRecords) return;
    const toRemove = count - this.maxRecords;
    const keys = await this.db.txs.toCollection().limit(toRemove).primaryKeys();
    if (keys.length > 0) {
      await this.db.txs.bulkDelete(keys as string[]);
    }
  }
}

const transactionStore: X402TransactionStore = hasIndexedDB
  ? new IndexedDBStore(2000)
  : new MemoryStore(2000);

// Keep a loose return type to avoid leaking local types into other parts of the app
export function getX402TransactionStore(): any {
  return transactionStore;
}

export interface RecordX402PaymentAttemptParams {
  ctxId: string;
  requirement: X402PaymentRequirement;
}

export async function recordX402PaymentAttempt(
  params: RecordX402PaymentAttemptParams,
): Promise<void> {
  if (!params.ctxId) return;
  const existing = await transactionStore.get(params.ctxId);
  if (existing) return;
  const record: X402TransactionRecord = {
    clientTxRef: params.ctxId,
    requirement: params.requirement,
  };
  await transactionStore.create(record);
}

export interface MarkX402PaymentResultParams {
  ctxId: string;
  response?: X402PaymentResponse;
}

export async function markX402PaymentResult(
  params: MarkX402PaymentResultParams,
): Promise<void> {
  if (!params.ctxId) return;
  const existing = await transactionStore.get(params.ctxId);
  if (!existing) return;
  await transactionStore.update(params.ctxId, {
    response: params.response ?? existing.response,
  });
}

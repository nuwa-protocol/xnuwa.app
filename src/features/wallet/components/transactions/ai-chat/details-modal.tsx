import { formatAmount } from '@nuwa-ai/payment-kit';
import { useState } from 'react';
import type { PaymentTransaction } from '@/features/wallet/types';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/components/ui/table';

const getAssetDecimals = (
  details: PaymentTransaction['details'] | null,
): number => {
  const dec = details?.requirement?.extra?.assetDecimals;
  return Number.isInteger(dec) ? Number(dec) : 6;
};

const formatCost = (details: PaymentTransaction['details'] | null) => {
  if (!details) return null;
  const raw = details.requirement?.maxAmountRequired;
  if (raw === undefined || raw === null) return null;
  const amount = BigInt(String(raw));
  const decimals = getAssetDecimals(details);
  return `$${formatAmount(amount, decimals)}`;
};

// Build a BaseScan URL when a transaction hash is available
const getBaseScanUrl = (
  details: PaymentTransaction['details'] | null,
): string | null => {
  if (!details) return null;
  const tx = details.response?.transaction as string | undefined;
  if (!tx) return null;
  const network = details.requirement?.network;
  const host = network === 'base' ? 'basescan.org' : 'sepolia.basescan.org';
  return `https://${host}/tx/${tx}`;
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'undefined';
  const localString = new Date(timestamp).toLocaleString();
  return `${timestamp} (${localString})`;
};

interface CopyableCellProps {
  value: string | number | boolean | null;
  isNested?: boolean;
}

function CopyableCell({ value, isNested = false }: CopyableCellProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = value === null ? 'null' : String(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <TableCell
      className={`cursor-pointer hover:bg-muted/50 transition-colors font-mono text-xs break-all ${value === null ? 'text-muted-foreground italic' : ''
        } ${isNested ? 'pl-8' : ''}`}
      onClick={handleCopy}
      title="Click to copy"
    >
      {copied ? <span className="text-green-600">Copied!</span> : displayValue}
    </TableCell>
  );
}

interface TableRowItemProps {
  label: string;
  value: string | number | boolean | null;
  isNested?: boolean;
}

function TableRowItem({ label, value, isNested = false }: TableRowItemProps) {
  return (
    <TableRow>
      <TableCell className={`font-medium text-sm ${isNested ? 'pl-8' : ''}`}>
        {label}
      </TableCell>
      <CopyableCell value={value} isNested={isNested} />
    </TableRow>
  );
}

interface TransactionDetailsModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export function AITransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const details = transaction.details;
  const txUrl = getBaseScanUrl(details);

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Table>
            <TableBody>
              {/* Basic Information */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Request Information
                </TableCell>
              </TableRow>
              <TableRowItem
                label="Context ID"
                value={transaction.info.ctxId}
                isNested
              />
              <TableRowItem
                label="Payment Type"
                value={transaction.info.type}
                isNested
              />
              <TableRowItem
                label="Chat Timestamp"
                value={formatDate(transaction.info.timestamp)}
                isNested
              />
              <TableRowItem
                label="Message"
                value={transaction.info.message || null}
                isNested
              />

              {/* Transaction Details */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Payment Requirements
                </TableCell>
              </TableRow>
              <TableRowItem
                label="Network"
                value={details?.requirement?.network || null}
                isNested
              />
              <TableRowItem
                label="Resource"
                value={details?.requirement?.resource || null}
                isNested
              />
              <TableRowItem
                label="Mime Type"
                value={details?.requirement?.mimeType || null}
                isNested
              />
              <TableRowItem
                label="Asset"
                value={details?.requirement?.asset || null}
                isNested
              />
              <TableRowItem
                label="Pay To"
                value={details?.requirement?.payTo || null}
                isNested
              />
              <TableRowItem
                label="Max Amount Required"
                value={
                  details?.requirement?.maxAmountRequired !== undefined &&
                    details?.requirement?.maxAmountRequired !== null
                    ? formatCost(details)
                    : null
                }
                isNested
              />
              <TableRowItem
                label="Scheme"
                value={details?.requirement?.scheme || null}
                isNested
              />
              <TableRowItem
                label="Description"
                value={(details?.requirement as any)?.description ?? null}
                isNested
              />

              {/* Payment Information */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Payment Response
                </TableCell>
              </TableRow>
              <TableRowItem
                label="Success"
                value={details?.response?.success ?? null}
                isNested
              />
              <TableRowItem
                label="Network"
                value={details?.response?.network || null}
                isNested
              />
              <TableRowItem
                label="Payer"
                value={details?.response?.payer || null}
                isNested
              />
              <TableRowItem
                label="Transaction Hash"
                value={details?.response?.transaction ?? null}
                isNested
              />
              {txUrl && (
                <TableRow>
                  <TableCell className="pl-8" colSpan={2}>
                    <Button asChild size="sm" variant="outline">
                      <a href={txUrl} target="_blank" rel="noopener noreferrer">
                        View on BaseScan
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

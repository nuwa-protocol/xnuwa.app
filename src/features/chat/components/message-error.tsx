import { AlertTriangle, Bug, RefreshCw, Wallet2, WalletIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  ChatErrorCode,
  resolveChatErrorCode,
} from '@/shared/utils/handle-error';

interface MessageErrorProps {
  error: Error;
  onRetry?: () => void;
  onOpenWallet?: () => void;
}

const ERROR_COPY: Record<
  Exclude<ChatErrorCode, ChatErrorCode.IGNORED_ERROR>,
  { title: string; description: string; bullets: string[] }
> = {
  [ChatErrorCode.INSUFFICIENT_FUNDS]: {
    title: 'Oops, you are out of credits',
    description: 'Top up your balance and then retry the response.',
    bullets: [
      'Top up your balance and then retry the response.',
      'If this keeps happening, contact us so we can double check your wallet status.',
    ],
  },
  [ChatErrorCode.UNKNOWN_ERROR]: {
    title: 'Something went wrong',
    description:
      'We hit a hiccup while generating this answer. Here are a few things to try:',
    bullets: [
      'Check your internet connection and then retry the response.',
      'The Cap you’re using might be misconfigured or temporarily down—Nuwa is an open platform, so community Caps can occasionally break.',
      'If the issue persists, report the Cap so our team can investigate.',
    ],
  },
};

export function MessageError({
  error,
  onRetry,
  onOpenWallet,
}: MessageErrorProps) {
  const errorCode = useMemo(() => resolveChatErrorCode(error), [error]);

  const normalizedCode =
    errorCode === ChatErrorCode.IGNORED_ERROR
      ? ChatErrorCode.UNKNOWN_ERROR
      : (errorCode as Exclude<ChatErrorCode, ChatErrorCode.IGNORED_ERROR>);

  const copy = ERROR_COPY[normalizedCode];
  const isInsufficientFunds =
    normalizedCode === ChatErrorCode.INSUFFICIENT_FUNDS;
  const shouldShowWalletAction = isInsufficientFunds && Boolean(onOpenWallet);

  const cardClasses = isInsufficientFunds
    ? 'relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm dark:bg-amber-900/20 dark:border-amber-500/40'
    : 'relative overflow-hidden rounded-xl border border-destructive/40 bg-destructive/10 p-5 shadow-sm dark:bg-destructive/20';

  return (
    <div className={cardClasses}>
      <div className="flex items-start gap-4">
        <div
          className={
            isInsufficientFunds
              ? 'mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm dark:bg-amber-500/10'
              : 'mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-destructive shadow-sm dark:bg-destructive/20'
          }
        >
          {isInsufficientFunds ? (
            <Wallet2 className="size-5" />
          ) : (
            <AlertTriangle className="size-5" />
          )}
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {copy.title}
            </h4>
            <p className="text-sm text-muted-foreground">{copy.description}</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {copy.bullets.map((item) => (
                <li
                  key={`${copy.title}-${item}`}
                  className="flex items-start gap-2"
                >
                  <span
                    className="mt-1 block h-1.5 w-1.5 rounded-full bg-destructive"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            {onRetry && !isInsufficientFunds && (
              <Button
                size="sm"
                className="gap-2"
                onClick={onRetry}
                variant="default"
              >
                <RefreshCw className="size-4" />
                Retry response
              </Button>
            )}
            {shouldShowWalletAction && onOpenWallet && (
              <Button
                size="sm"
                className="gap-2"
                onClick={onOpenWallet}
                variant="primary"
              >
                <WalletIcon className="size-4" />
                Open wallet
              </Button>
            )}
            {!isInsufficientFunds && (
              <Button
                size="sm"
                className="gap-2 ml-auto"
                variant="ghost"
                onClick={() => {
                  // TODO: wire up cap issue reporting
                }}
              >
                <Bug className="size-4" />
                Report Cap Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

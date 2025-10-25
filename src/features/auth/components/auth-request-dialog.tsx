import { OTPInputContext } from 'input-otp';
import {
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputOTP,
  InputOTPGroup,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { AccountStore } from '../store';
import type { AuthRequestCallback } from '../types';

const PIN_LENGTH = 6;
const PIN_SLOT_KEYS = Array.from(
  { length: PIN_LENGTH },
  (_, index) => `otp-slot-${index}`,
);

type AuthReason = Parameters<AuthRequestCallback>[1];
type AuthResult = Awaited<ReturnType<AuthRequestCallback>>;

type PendingAuthRequest = {
  address: string;
  reason: AuthReason;
  isFallback: boolean;
  resolve: (result: AuthResult) => void;
  reject: (reason?: unknown) => void;
};

const REASON_COPY: Record<AuthReason, { title: string; description: string }> =
{
  sign_message: {
    title: 'Message Signature Required',
    description:
      'The app needs your approval to sign the requested message with your wallet.',
  },
  sign_transaction: {
    title: 'Transaction Approval Required',
    description:
      'Review and authorize this transaction to continue with the requested action.',
  },
  sign_typed_data: {
    title: 'Typed Data Signature Required',
    description:
      'Please confirm the structured data request to proceed securely.',
  },
  export_private_key: {
    title: 'Export Private Key',
    description:
      'For security reasons, exporting your private key requires you to re-authenticate.',
  },
};

export function AuthRequestDialog() {
  const setAuthRequestCallback = AccountStore(
    (state) => state.setAuthRequestCallback,
  );
  const accounts = AccountStore((state) => state.accounts);

  const [request, setRequest] = useState<PendingAuthRequest | null>(null);
  const [pin, setPin] = useState('');
  const pendingRef = useRef<PendingAuthRequest | null>(null);

  useEffect(() => {
    const callback: AuthRequestCallback = (address, reason, fallback) => {
      return new Promise<AuthResult>((resolve, reject) => {
        if (pendingRef.current) {
          pendingRef.current.reject(
            new Error('A new authorization request was triggered.'),
          );
        }

        const nextRequest: PendingAuthRequest = {
          address,
          reason,
          isFallback: Boolean(fallback),
          resolve,
          reject,
        };

        pendingRef.current = nextRequest;
        setRequest(nextRequest);
        setPin('');
      });
    };

    setAuthRequestCallback(callback);

    return () => {
      setAuthRequestCallback(null);
      if (pendingRef.current) {
        pendingRef.current.reject(new Error('Authorization dialog unmounted.'));
        pendingRef.current = null;
      }
      setRequest(null);
      setPin('');
    };
  }, [setAuthRequestCallback]);

  const accountData = useMemo(() => {
    if (!request) return null;
    return (
      accounts.find((account) => account.address === request.address) ?? null
    );
  }, [accounts, request]);

  const hasPasskey = Boolean(accountData?.authMethods.passkey);
  const reasonCopy = request ? REASON_COPY[request.reason] : null;
  const pinComplete = pin.length === PIN_LENGTH;

  const closeAndReset = useCallback(() => {
    pendingRef.current = null;
    setRequest(null);
    setPin('');
  }, []);

  const handleCancel = () => {
    if (!request) return;
    request.reject(new Error('Authorization was cancelled by the user.'));
    closeAndReset();
  };

  const autoSubmitPin = useCallback(() => {
    if (!request || !pinComplete) return;
    request.resolve({ method: 'pin', pin });
    closeAndReset();
  }, [closeAndReset, pin, pinComplete, request]);

  useEffect(() => {
    if (!request || !pinComplete) return;
    autoSubmitPin();
  }, [autoSubmitPin, pinComplete, request]);

  const handlePinChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(sanitized);
  };

  const handlePinSubmit = (event: FormEvent) => {
    event.preventDefault();
    autoSubmitPin();
  };

  const handlePasskey = () => {
    if (!request || !hasPasskey) return;
    request.resolve({ method: 'passkey' });
    closeAndReset();
  };

  const shortAddress = (value?: string) => {
    if (!value) return 'Unknown address';
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
  };

  const fallbackMessage =
    request?.isFallback && hasPasskey
      ? 'Your previous passkey attempt was cancelled or failed. You can try again or use your PIN code.'
      : request?.isFallback
        ? 'Passkey is unavailable for this request. Please use your PIN code.'
        : null;

  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {reasonCopy?.title ?? 'Authorization Required'}
          </DialogTitle>
          <DialogDescription>
            {reasonCopy?.description}
            {fallbackMessage ? (
              <span className="block mt-2 text-[0.85rem] text-muted-foreground">
                {fallbackMessage}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {hasPasskey ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Prefer to use biometrics? Try passkey authentication again.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handlePasskey}
              >
                Use Passkey
              </Button>
            </div>
          ) : null}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium">Authorize with Your PIN</p>
              <InputOTP
                value={pin}
                onChange={handlePinChange}
                maxLength={PIN_LENGTH}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {PIN_SLOT_KEYS.map((slotKey, slotIndex) => (
                    <MaskedPinSlot key={slotKey} index={slotIndex} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter className="flex-col w-full">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                className="w-full "
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MaskedPinSlot({ index }: { index: number }) {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  const isFilled = Boolean(char);

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={isFilled}
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
      )}
    >
      {isFilled ? '*' : ''}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { OTPInputContext } from 'input-otp';
import { Loader2, X } from 'lucide-react';
import { useContext, useEffect, useId, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  InputOTP,
  InputOTPGroup,
  Input,
  Label,
  Switch,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { AccountStore, IS_PASSKEY_SUPPORTED } from '../store';

const PIN_LENGTH = 6;
const DEFAULT_ACCOUNT_PLACEHOLDER = 'Nuwa Account';
const PIN_SLOT_KEYS = Array.from(
  { length: PIN_LENGTH },
  (_, index) => `pin-slot-${index}`,
);

type AccountLoginDialogProps = {
  // Controlled open state from parent
  open: boolean;
  // Optional: allow parent to react to open state changes
  onOpenChange?: (open: boolean) => void;
};

export function AccountLoginDialog({ open, onOpenChange }: AccountLoginDialogProps) {
  const accounts = AccountStore((state) => state.accounts);
  const switchAccount = AccountStore((state) => state.setCurrentAccount);
  const createAccount = AccountStore((state) => state.createAccount);
  const addPasskeyAuth = AccountStore((state) => state.addPasskeyAuth);

  const [view, setView] = useState<'list' | 'create'>('list');
  const [createName, setCreateName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enablePasskey, setEnablePasskey] = useState(IS_PASSKEY_SUPPORTED);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const nameInputId = useId();
  const pinInputId = useId();
  const confirmPinInputId = useId();

  useEffect(() => {
    if (accounts.length === 0) {
      setView('create');
    }
  }, [accounts.length]);

  useEffect(() => {
    // Reset internal state when dialog closes
    if (!open) {
      setCreateError(null);
      setSelectionError(null);
      setPin('');
      setConfirmPin('');
      setEnablePasskey(IS_PASSKEY_SUPPORTED);
      setView(accounts.length === 0 ? 'create' : 'list');
    }
  }, [accounts.length, open]);

  const shouldRender = open || isSubmitting;

  const shortAddress = useMemo(
    () => (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`,
    [],
  );

  const handleAccountSelect = (address: string) => {
    setSelectionError(null);
    try {
      switchAccount(address);
    } catch (error) {
      setSelectionError(
        error instanceof Error ? error.message : 'Failed to switch account.',
      );
    }
  };

  const handleCreateAccount = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isSubmitting) return;

    if (pin.length !== PIN_LENGTH) {
      setCreateError(`PIN code must be ${PIN_LENGTH} digits.`);
      return;
    }

    if (pin !== confirmPin) {
      setCreateError('PIN codes must match.');
      return;
    }

    setCreateError(null);
    setIsSubmitting(true);

    try {
      const finalName =
        createName.trim().length > 0 ? createName.trim() : DEFAULT_ACCOUNT_PLACEHOLDER;

      await createAccount(finalName, pin);

      if (enablePasskey && IS_PASSKEY_SUPPORTED) {
        try {
          await addPasskeyAuth();
          toast.success('Passkey has been enabled for your new account.');
        } catch (passkeyError) {
          console.error(passkeyError);
          toast.error(
            passkeyError instanceof Error
              ? passkeyError.message
              : 'Unable to enable Passkey. You can turn it on later in settings.',
          );
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create account.';
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Choose an account to continue.
        </p>
      </div>

      <div className="max-h-[320px] space-y-3 overflow-y-auto pr-2">
        {accounts.map((account) => (
          <button
            key={account.address}
            type="button"
            className="w-full rounded-lg border border-border/70 bg-card px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => handleAccountSelect(account.address)}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold">
                  {account.name || DEFAULT_ACCOUNT_PLACEHOLDER}
                </p>
                <p className="text-xs text-muted-foreground">
                  {shortAddress(account.address)}
                </p>
              </div>
              <span className="text-xs text-primary">Use</span>
            </div>
          </button>
        ))}
      </div>

      {selectionError ? (
        <p className="text-sm text-destructive">{selectionError}</p>
      ) : null}

      <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-2 text-sm text-muted-foreground">
        <span>Need another wallet?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('create')}
        >
          Create new
        </Button>
      </div>
    </div>
  );

  const renderCreateForm = () => (
    <form className="space-y-6" onSubmit={handleCreateAccount}>
      <div className="space-y-1">
        <Label htmlFor={nameInputId}>Account name</Label>
        <Input
          id={nameInputId}
          placeholder={DEFAULT_ACCOUNT_PLACEHOLDER}
          value={createName}
          onChange={(event) => setCreateName(event.target.value)}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          This is optional. You can rename your account later.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={pinInputId}>PIN code</Label>
        <InputOTP
          id={pinInputId}
          maxLength={PIN_LENGTH}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={pin}
          onChange={(value) => {
            const numericValue = value.replace(/\D/g, '').slice(0, PIN_LENGTH);
            setPin(numericValue);
            setCreateError(null);
          }}
          containerClassName="flex flex-wrap gap-2"
          aria-invalid={pin.length > 0 && pin.length !== PIN_LENGTH}
        >
          <InputOTPGroup className="flex flex-wrap gap-2">
            {PIN_SLOT_KEYS.map((slotKey, slotIndex) => (
              <MaskedPinSlot key={slotKey} index={slotIndex} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p className="text-xs text-muted-foreground">
          Enter a {PIN_LENGTH}-digit PIN. Keep this safe to unlock your wallet.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={confirmPinInputId}>Confirm PIN code</Label>
        <InputOTP
          id={confirmPinInputId}
          maxLength={PIN_LENGTH}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={confirmPin}
          onChange={(value) => {
            const numericValue = value.replace(/\D/g, '').slice(0, PIN_LENGTH);
            setConfirmPin(numericValue);
            setCreateError(null);
          }}
          containerClassName="flex flex-wrap gap-2"
          aria-invalid={confirmPin.length > 0 && pin !== confirmPin}
        >
          <InputOTPGroup className="flex flex-wrap gap-2">
            {PIN_SLOT_KEYS.map((slotKey, slotIndex) => (
              <MaskedPinSlot key={`${slotKey}-confirm`} index={slotIndex} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {confirmPin.length > 0 && pin !== confirmPin ? (
          <p className="text-xs text-destructive">
            PIN codes do not match.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Re-enter the same PIN to confirm.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <div>
          <p className="text-sm font-medium">Enable passkey</p>
          <p className="text-xs text-muted-foreground">
            {IS_PASSKEY_SUPPORTED
              ? 'Use Face ID, Touch ID, or biometrics for quick unlock.'
              : 'Passkey is not supported in this browser.'}
          </p>
        </div>
        <Switch
          checked={enablePasskey && IS_PASSKEY_SUPPORTED}
          disabled={!IS_PASSKEY_SUPPORTED}
          onCheckedChange={(checked) => setEnablePasskey(checked)}
        />
      </div>

      {createError ? (
        <p className="text-sm text-destructive">{createError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        {accounts.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setView('list')}
            disabled={isSubmitting}
          >
            Back
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={
            isSubmitting || pin.length !== PIN_LENGTH || pin !== confirmPin
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </div>
    </form>
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={cn('backdrop-blur-sm', 'bg-black/80')} />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 w-full max-w-2xl rounded-2xl border border-border bg-background/95 p-6 shadow-2xl transition-all',
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          )}
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-semibold">
                  Unlock Nuwa
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  {accounts.length > 0
                    ? 'Choose an existing account or create a new one to continue.'
                    : 'Create your first Nuwa account to continue.'}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => onOpenChange?.(false)}
                aria-label="Close login dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {view === 'list' && accounts.length > 0
              ? renderAccounts()
              : renderCreateForm()}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
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
        'border-input bg-muted/70 text-base font-medium data-[active=true]:bg-background data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/40 relative flex h-11 w-11 items-center justify-center border-y border-r shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]',
      )}
    >
      {isFilled ? '*' : ''}
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  );
}

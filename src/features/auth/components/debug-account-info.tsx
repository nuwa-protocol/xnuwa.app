import { ChevronDown, ChevronUp, Clock, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AccountStore, IS_PASSKEY_SUPPORTED } from '@/features/auth/store';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export function DebugAccountInfo() {
    const {
        account,
        accounts,
        createAccount,
        deleteAccount,
        renameAccount,
        setCurrentAccount,
        setSessionDuration,
        getSessionExpiresAt,
        getAccountData,
        _clearSession,
        addPasskeyAuth,
        removePasskeyAuth,
        _authenticateWithPasskey,
    } = AccountStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [, forceRefresh] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            forceRefresh((tick) => tick + 1);
        }, 1000);

        return () => window.clearInterval(interval);
    }, []);

    const sessionExpiresAt = getSessionExpiresAt();
    const sessionRemainingTime = sessionExpiresAt
        ? Math.max(0, sessionExpiresAt - Date.now())
        : 0;
    const sessionMinutes = Math.floor(sessionRemainingTime / 60000);
    const sessionSeconds = Math.floor((sessionRemainingTime % 60000) / 1000);

    if (!account) {
        return (
            <div>
                <p>No account selected</p>
            </div>
        );
    }

    const accountData = getAccountData(account.address);
    if (!accountData) {
        return (
            <div>
                <p>Account data not found</p>
            </div>
        );
    }

    const handleSignMessage = async () => {
        const message = 'Hello, world!';
        try {
            const signature = await account.signMessage({ message });
            toast.success(`Message signed successfully: ${signature}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleRegisterPasskey = async () => {
        try {
            await addPasskeyAuth();
            toast.success('Passkey registered for this account');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleRemovePasskey = async () => {
        if (!window.confirm('Remove passkey authentication from this account?')) {
            return;
        }
        try {
            await removePasskeyAuth();
            toast.success('Passkey removed');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleTestPasskeyAuth = async () => {
        try {
            const key = await _authenticateWithPasskey();
            // Only show a short preview of the key to avoid leaking the full value in logs
            const preview = `${key.slice(0, 6)}...${key.slice(-4)}`;
            toast.success(`Passkey auth OK. Derived key unlocked (${preview})`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };


    const handleExportPrivateKey = async () => {
        try {
            const key = await account.DANGEROUS_exportPrivateKey();
            const preview = `${key.slice(0, 6)}...${key.slice(-4)}`;
            toast.success(`Private key unlocked (${preview})`);
            const shouldCopy = window.confirm(
                'Copy full private key to clipboard? This is sensitive. Only proceed if you understand the risk.',
            );
            if (shouldCopy) {
                try {
                    await navigator.clipboard.writeText(key);
                    toast.success('Private key copied to clipboard');
                } catch (copyErr) {
                    toast.error(
                        copyErr instanceof Error
                            ? copyErr.message
                            : String(copyErr),
                    );
                }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleCreateTestAccount = async () => {
        const defaultName = `Account ${accounts.length + 1}`;
        const name = window.prompt('New account name', defaultName);
        if (!name) {
            return;
        }
        const pin = window.prompt('PIN (>= 6 digits)', '123456');
        if (!pin) {
            toast.error('PIN is required');
            return;
        }

        try {
            await createAccount(name, pin);
            toast.success(`Created account ${name}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleRenameAccount = async () => {
        const accountData = getAccountData(account.address);
        const newName = window.prompt('Rename current account', accountData?.name);
        if (!newName) {
            return;
        }

        try {
            await renameAccount(account.address, newName);
            toast.success(`Renamed to ${newName}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Delete current account?')) {
            return;
        }

        try {
            await deleteAccount(account.address);
            toast.success('Account deleted');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleSetSessionDuration = () => {
        const accountData = getAccountData(account.address);
        const currentMinutes = accountData
            ? Math.round(accountData.sessionDuration / 60000)
            : 0;

        const minutesInput = window.prompt(
            'Session duration (minutes)',
            String(currentMinutes || 5),
        );
        if (!minutesInput) {
            return;
        }
        const minutes = Number(minutesInput);
        if (!Number.isFinite(minutes) || minutes <= 0) {
            toast.error('Invalid duration');
            return;
        }

        try {
            setSessionDuration(minutes * 60 * 1000);
            toast.success(`Session set to ${minutes}m`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const handleClearSession = () => {
        try {
            _clearSession();
            toast.success('Session cleared');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : String(error));
        }
    };

    const hasPasskey = Boolean(accountData.authMethods.passkey);
    const passkeySupported = Boolean(IS_PASSKEY_SUPPORTED);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
                <CardHeader className="pb-2 sr-only">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Debug Account Info
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {/* 基本信息 */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">{accountData.name}
                            </div>

                            <div className="text-xs text-muted-foreground font-mono break-all">
                                {account.address}
                            </div>
                        </div>

                        {/* Session 信息 */}
                        <div className="flex items-center gap-2 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>
                                Session: {sessionMinutes}:
                                {sessionSeconds.toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* 认证方式 */}
                        <div className="flex items-center gap-2 text-xs">
                            <Shield className="h-3 w-3" />
                            <span>
                                Auth: {account.isLocked() ? 'Locked' : 'Unlocked'}
                                {' · '}Passkey: {hasPasskey ? 'On' : 'Off'}
                                {' · '}Support: {passkeySupported ? 'Yes' : 'No'}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={handleSignMessage}>
                                Sign Message
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleCreateTestAccount}>
                                Create Account
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleRenameAccount}>
                                Rename
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDeleteAccount}>
                                Delete
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleSetSessionDuration}>
                                Set Session Duration
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleClearSession}>
                                Clear Session
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPrivateKey}
                                title="Export with forced re-authentication"
                            >
                                Export Key (Force Auth)
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRegisterPasskey}
                                disabled={!passkeySupported || hasPasskey}
                                title={passkeySupported ? '' : 'Browser does not support Passkey'}
                            >
                                Add Passkey
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemovePasskey}
                                disabled={!hasPasskey}
                            >
                                Remove Passkey
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTestPasskeyAuth}
                                disabled={!hasPasskey}
                            >
                                Test Passkey
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between"
                        >
                            <span>Accounts ({accounts.length})</span>
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                        {/* 展开的详细信息 */}
                        {isExpanded &&
                            accounts.map((acc, index) => (
                                <button
                                    key={acc.address}
                                    type="button"
                                    onClick={() => setCurrentAccount(acc.address)}
                                    className={`text-left w-full text-xs p-1 rounded transition hover:bg-primary/20 ${acc.address === account.address
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted/50'
                                        }`}
                                >
                                    {index + 1}. {acc.name} ({acc.address.slice(0, 6)}...)
                                </button>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

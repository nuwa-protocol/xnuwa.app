import { ChevronDown, ChevronUp, Clock, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AccountStore } from '@/features/auth/store';
import { Button } from '@/shared/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';

export function DebugAccountInfo() {
    const { account, accounts, getSessionRemainingTime, getAccountData } =
        AccountStore();
    const [isExpanded, setIsExpanded] = useState(false);

    const sessionRemainingTime = getSessionRemainingTime();
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
                            <span>Auth: {account.isLocked() ? 'Locked' : 'Unlocked'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <Button onClick={handleSignMessage}>Sign Message</Button>
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
                                <div
                                    key={acc.address}
                                    className={`text-xs p-1 rounded ${acc.address === account.address
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted/50'
                                        }`}
                                >
                                    {index + 1}. {acc.name} ({acc.address.slice(0, 6)}...)
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

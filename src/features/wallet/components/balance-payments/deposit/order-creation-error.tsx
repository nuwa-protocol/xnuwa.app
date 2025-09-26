import { RefreshCw, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

export type OrderCreationErrorProps = {
    error: string;
    retryCreate: () => void;
    isCreating: boolean;
};

export function OrderCreationError({ error, retryCreate, isCreating }: OrderCreationErrorProps) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="flex items-center gap-2 text-lg font-medium">
                    <XCircle className="h-5 w-5 text-destructive" /> Payment Creation
                    Failed
                </h3>
                <p className="text-sm text-muted-foreground">
                    We encountered an error while creating your payment order.
                </p>
            </div>
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center">
                <Button onClick={retryCreate} variant="outline" disabled={isCreating}>
                    {isCreating ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Retry Payment Creation
                </Button>
            </div>
        </div>
    );
}
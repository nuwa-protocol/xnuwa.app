import { Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function OrderCreating() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Creating Payment Order
                </CardTitle>
                <CardDescription>
                    Please wait while we prepare your payment details...
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    );
}

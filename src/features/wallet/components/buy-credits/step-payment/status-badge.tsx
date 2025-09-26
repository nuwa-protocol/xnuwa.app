import { XCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export const StatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
        case 'waiting':
            return (
                <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-200 bg-amber-50"
                >
                    Waiting
                </Badge>
            );
        case 'confirming':
            return (
                <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200 bg-blue-50"
                >
                    Confirming
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50"
                >
                    Completed
                </Badge>
            );
        case 'expired':
            return (
                <Badge
                    variant="outline"
                    className="text-red-600 border-red-200 bg-red-50"
                >
                    <XCircle className="w-3 h-3 mr-1" />
                    Expired
                </Badge>
            );
        case 'partially_paid':
            return (
                <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 bg-yellow-50"
                >
                    Partially Paid
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

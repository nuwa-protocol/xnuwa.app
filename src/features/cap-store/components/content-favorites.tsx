import { Package } from 'lucide-react';
import { useEffect } from 'react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { useCapStore } from '../stores';
import { CapCard } from './cap-card';
import { CapStoreLoading } from './cap-store-loading';

export function CapStoreFavoritesContent() {
    const { t } = useLanguage();
    const {
        favoriteCaps,
        favoriteCapsError,
        isFetchingFavoriteCaps,
        fetchFavoriteCaps,
    } = useCapStore();

    useEffect(() => {
        fetchFavoriteCaps();
    }, []);

    const caps = favoriteCaps;

    if (favoriteCapsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
                <Package className="size-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-red-600">
                    {t('capStore.status.error')}
                </h3>
                <p className="text-muted-foreground max-w-md mb-4">
                    {t('capStore.status.errorDesc')}
                </p>
                <Button variant="outline" onClick={fetchFavoriteCaps}>
                    {t('capStore.status.tryAgain')}
                </Button>
            </div>
        );
    }

    if (isFetchingFavoriteCaps) {
        return <CapStoreLoading />;
    }

    if (caps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
                <Package className="size-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Favorites</h3>
                <p className="text-muted-foreground max-w-md">
                    You haven't marked any caps as favorites yet. Browse the store and
                    favorite caps you like.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Caps Grid Container with ScrollArea */}
            <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
                    {caps.length > 0 &&
                        caps.map((cap) => {
                            const id = cap.id;

                            return <CapCard key={id} cap={cap} />;
                        })}
                </div>
            </ScrollArea>
        </div>
    );
}

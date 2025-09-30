import { TokenIcon } from '@web3icons/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components';
import type { Currency } from '../../../types';


export function CurrencyInfo({
    currency,
    placeholder,
}: {
    currency: Currency | null;
    placeholder?: string;
}) {
    const [tokenIconError, setTokenIconError] = useState(false);

    if (!currency) {
        return (
            <div className="flex flex-row items-center gap-2">
                <span>{placeholder}</span>
            </div>
        );
    }
    return (
        <div className="flex flex-row items-center gap-2">
            <Avatar className="size-6">
                <AvatarImage
                    src={currency?.logo_url}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                />
                <AvatarFallback>
                    {tokenIconError ? (
                        123
                    ) : (
                        <TokenIcon
                            symbol={currency.code}
                            variant="branded"
                            onError={() => setTokenIconError(true)}
                        />
                    )}
                </AvatarFallback>
            </Avatar>

            <span>{currency.code}</span>
        </div>
    );
}

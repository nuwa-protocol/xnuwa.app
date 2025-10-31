import { Loader2, MessageSquare, PackagePlus } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import type { Cap } from '@/shared/types';
import type { RemoteCap } from '../types';

export const CapActionButton = ({
    cap,
    disabled = false,
}: {
    cap: Cap | RemoteCap;
    disabled?: boolean;
}) => {
    const navigate = useNavigate();
    const { installedCaps, installCap } = InstalledCapsStore();
    const { setCurrentCap } = CurrentCapStore();
    const [isInstalling, setIsInstalling] = useState(false);

    const isInstalled = installedCaps.some((c) => c.id === cap.id);


    const handleInstallCap = async (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isInstalling) return;
        setIsInstalling(true);
        installCap(cap.id).then((cap) => {
            setCurrentCap(cap);
            toast.success(`Installed ${cap.metadata.displayName}`);
        }).catch(() => {
            toast.error('Failed to install. Please try again.');
        }).finally(() => {
            setIsInstalling(false);
        })
    };

    const handleUseCap = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (!isInstalled) return;
        const capToUse = installedCaps.find((c) => c.id === cap.id);
        if (!capToUse) return;

        setCurrentCap(capToUse);
        navigate(`/chat`);
    };

    const isDisabled = disabled || isInstalling;

    return (
        <Button
            onClick={isInstalled ? handleUseCap : handleInstallCap}
            variant="primary"
            size="sm"
            className="shrink-0 gap-2 h-9 min-w-[110px] px-3 text-sm"
            disabled={isDisabled}
        >
            <ButtonContent
                isInstalled={isInstalled}
                isInstalling={isInstalling}
                disabled={disabled}
            />
        </Button>
    );
};

const ButtonContent = ({
    isInstalled,
    isInstalling,
    disabled,
}: {
    isInstalled: boolean;
    isInstalling: boolean;
    disabled?: boolean;
}) => {
    if (disabled) {
        return (
            <>
                <PackagePlus className="w-4 h-4 text-white opacity-60" />
                Invalid
            </>
        );
    }
    if (isInstalled) {
        return (
            <>
                <MessageSquare className="w-4 h-4 text-white" />
                Chat
            </>
        );
    }

    if (isInstalling) {
        return (
            <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Installing...
            </>
        );
    }

    return (
        <>
            <PackagePlus className="w-4 h-4 text-white" />
            Install
        </>
    );
};

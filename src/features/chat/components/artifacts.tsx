import { useState } from 'react';
import { CapAvatar } from '@/shared/components/cap-avatar';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';
import type { Cap } from '@/shared/types';
import { Artifact, type ArtifactInstance } from './artifact';

type ArtifactsProps = {
    artifacts: ArtifactInstance[];
};

// Multiple-artifact panel with a simple tab-like header.
export const Artifacts = ({ artifacts }: ArtifactsProps) => {
    const tabs = artifacts.map((inst) => {
        const c: any = inst.cap;
        return ('capData' in c ? 'local:' : 'remote:') + c.id;
    });
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    if (!artifacts || artifacts.length === 0) return null;

    if (artifacts.length === 1) {
        return <Artifact instance={artifacts[0]} />;
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="flex h-full flex-col"
        >
            <TabsList className="before:bg-border relative h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px overflow-x-auto hide-scrollbar whitespace-nowrap !justify-start">
                {artifacts.map((inst, idx) => {
                    const cap =
                        'capData' in inst.cap ? inst.cap.capData : (inst.cap as Cap);
                    const label = cap.metadata?.displayName || cap.idName;
                    const value = tabs[idx];
                    return (
                        <TabsTrigger
                            key={value}
                            value={value}
                            title={label}
                            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none w-40 text-xs truncate flex items-center gap-2 shrink-0"
                        >
                            <CapAvatar cap={inst.cap as any} size="sm" />
                            <span className="truncate">{label}</span>
                        </TabsTrigger>
                    );
                })}
            </TabsList>
            <div className="relative min-h-0 flex-1">
                {artifacts.map((inst, idx) => {
                    const value = tabs[idx];
                    return (
                        <TabsContent
                            key={value}
                            value={value}
                            forceMount
                            className="mt-0 h-full p-0 data-[state=inactive]:hidden"
                        >
                            <Artifact instance={inst} />
                        </TabsContent>
                    );
                })}
            </div>
        </Tabs>
    );
};

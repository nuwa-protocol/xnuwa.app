import React from 'react';
import { SettingCard } from './setting-card';

interface SettingSectionProps {
  title: string;
  description: string;
  settingCards: React.ComponentProps<typeof SettingCard>[];
}

export function SettingSection({
  title,
  description,
  settingCards,
}: SettingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {settingCards.map((cardProps) => (
        <SettingCard key={cardProps.title} {...cardProps} />
      ))}
    </div>
  );
}

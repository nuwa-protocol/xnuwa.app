import type React from 'react';
import { SettingCard } from './setting-card';

interface SettingSectionProps {
  title?: string;
  description?: string;
  settingCards?: React.ComponentProps<typeof SettingCard>[];
  customComponent?: React.ReactNode;
}

export function SettingSection({
  title,
  description,
  settingCards,
  customComponent,
}: SettingSectionProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {customComponent && customComponent}
      {settingCards?.map((cardProps) => (
        <SettingCard key={cardProps.title} {...cardProps} />
      ))}
    </div>
  );
}

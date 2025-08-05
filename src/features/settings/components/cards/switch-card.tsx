import { Switch } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface SwitchCardProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function SwitchCard({
  title,
  description,
  checked,
  onChange,
  disabled,
  className,
}: SwitchCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-8 p-6 border rounded-lg bg-background shadow-sm',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold mb-1">{title}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="shrink-0">
        <Switch
          defaultChecked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
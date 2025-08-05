import { Button, Input } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface SingleInputCardProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SingleInputCard({
  title,
  description,
  value,
  onChange,
  placeholder,
  buttonLabel,
  onButtonClick,
  disabled,
  className,
}: SingleInputCardProps) {
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
        <div className="flex gap-2 items-center">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="max-w-md"
            disabled={disabled}
          />
          {buttonLabel && (
            <Button onClick={onButtonClick} disabled={disabled} size="sm">
              {buttonLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
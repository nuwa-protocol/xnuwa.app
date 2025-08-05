import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface SingleSelectCardProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
  className?: string;
}

export function SingleSelectCard({
  title,
  description,
  value,
  onChange,
  options,
  disabled,
  className,
}: SingleSelectCardProps) {
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
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
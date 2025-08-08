import { useState } from 'react';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface DangerActionCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  confirmationButtonLabel?: string;
  cancelButtonLabel?: string;
  className?: string;
}

export function DangerActionCard({
  title,
  description,
  buttonLabel,
  onClick,
  disabled,
  confirmationTitle,
  confirmationDescription,
  confirmationButtonLabel,
  cancelButtonLabel,
  className,
}: DangerActionCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-8 p-6 border rounded-lg bg-background shadow-sm border-red-500 border-2',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold mb-1 text-red-500 font-bold">
          {title}
        </div>
        <div className="text-muted-foreground text-sm text-red-500 font-medium">
          {description}
        </div>
      </div>
      <div className="shrink-0">
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={disabled}
          >
            {buttonLabel}
          </Button>
        </div>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg p-6 shadow-lg max-w-sm w-full">
              <div className="font-semibold mb-2">
                {confirmationTitle || 'Are you sure?'}
              </div>
              <div className="mb-4 text-sm text-muted-foreground">
                {confirmationDescription || 'This action cannot be undone.'}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={disabled}
                >
                  {cancelButtonLabel || 'Cancel'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowConfirm(false);
                    onClick();
                  }}
                  disabled={disabled}
                >
                  {confirmationButtonLabel || buttonLabel}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

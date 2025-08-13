import { MoreHorizontal } from 'lucide-react';
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import type { CapMetadata } from '@/shared/types/cap';
import { CapAvatar } from './cap-avatar';

interface CapCardActions {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export interface CapCardProps {
  capMetadata: CapMetadata;
  onClick: () => void;
  actions?: CapCardActions[];
}

export function CapCard({ capMetadata, onClick, actions }: CapCardProps) {
  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <CapAvatar
          capName={capMetadata.displayName}
          capThumbnail={capMetadata.thumbnail}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">
            {capMetadata.displayName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {capMetadata.description}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1.5 hover:bg-muted rounded-sm transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">More Actions</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {actions?.map((action) => (
              <DropdownMenuItem key={action.label} onClick={action.onClick}>
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

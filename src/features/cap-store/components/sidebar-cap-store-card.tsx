import { Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils';

interface SidebarCapStoreCardProps {
  className?: string;
}

export function SidebarCapStoreCard({ className }: SidebarCapStoreCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/cap-store');
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 border-border/50 hover:bg-accent/50 hover:shadow-xl hover:scale-[1.02]',
        'py-2',
        className,
      )}
      onClick={handleClick}
    >
      <CardContent className="px-3 h-6">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 p-1 text-muted-foreground">
            <Layers className="size-4" />
            <span className="text-xs font-medium">Cap Store</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

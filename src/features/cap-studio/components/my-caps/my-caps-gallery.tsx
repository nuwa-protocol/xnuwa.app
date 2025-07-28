import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  type LocalCap,
  useCapStudioStore,
} from '@/features/cap-studio/stores/model-stores';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/components/ui';
import { DashboardGrid } from '../layout/dashboard-layout';
import { CapCard } from './cap-card';

interface MyCapsGalleryProps {
  onEditCap?: (cap: LocalCap) => void;
  onTestCap?: (cap: LocalCap) => void;
  onSubmitCap?: (cap: LocalCap) => void;
  onCreateNew?: () => void;
}

export function MyCapsGallery({
  onEditCap,
  onTestCap,
  onSubmitCap,
  onCreateNew,
}: MyCapsGalleryProps) {
  const { localCaps } = useCapStudioStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Get caps array
  const capsArray = localCaps;

  // Filter caps by search query only
  const filteredCaps = useMemo(() => {
    if (!searchQuery) return capsArray;

    const query = searchQuery.toLowerCase();
    return capsArray.filter(
      (cap) =>
        cap.name.toLowerCase().includes(query) ||
        cap.description.toLowerCase().includes(query) ||
        cap.tag.toLowerCase().includes(query),
    );
  }, [capsArray, searchQuery]);

  if (capsArray.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
        <CardHeader className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-muted-foreground">
            No Caps Yet
          </CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            You haven't created any caps yet. Start building your first
            capability to get started with cap development.
          </CardDescription>
          <div className="pt-4">
            <Button onClick={onCreateNew} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Cap
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button onClick={onCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Cap
          </Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search caps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Caps list */}
      {filteredCaps.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-muted-foreground">
              No matching caps
            </CardTitle>
            <CardDescription>
              Try adjusting your search criteria
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <DashboardGrid cols={1}>
          {filteredCaps.map((cap) => (
            <CapCard
              key={cap.id}
              cap={cap}
              onEdit={() => onEditCap?.(cap)}
              onTest={() => onTestCap?.(cap)}
              onSubmit={() => onSubmitCap?.(cap)}
              onClick={() => onEditCap?.(cap)}
              viewMode="list"
            />
          ))}
        </DashboardGrid>
      )}
    </div>
  );
}

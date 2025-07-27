import {
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { type LocalCap, useCapDevStore } from '@/features/cap-dev/stores/model-stores';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Toggle,
} from '@/shared/components/ui';
import { DashboardGrid } from '../layout/dashboard-layout';
import { CapCard } from './cap-card';

type SortField = 'name' | 'updatedAt' | 'tag' | 'version';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface MyCapsGalleryProps {
  onEditCap?: (cap: LocalCap) => void;
  onDebugCap?: (cap: LocalCap) => void;
  onSubmitCap?: (cap: LocalCap) => void;
  onCreateNew?: () => void;
}

export function MyCapsGallery({
  onEditCap,
  onDebugCap,
  onSubmitCap,
  onCreateNew,
}: MyCapsGalleryProps) {
  const { localCaps } = useCapDevStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Get unique tags
  const capsArray = localCaps;
  const uniqueTags = useMemo(
    () => [...new Set(capsArray.map((cap) => cap.tag))].sort(),
    [capsArray],
  );

  // Filter and sort caps
  const filteredAndSortedCaps = useMemo(() => {
    let filtered = capsArray;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cap) =>
          cap.name.toLowerCase().includes(query) ||
          cap.description.toLowerCase().includes(query) ||
          cap.tag.toLowerCase().includes(query),
      );
    }

    // Apply tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter((cap) => cap.tag === tagFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [capsArray, searchQuery, tagFilter, sortField, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

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
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            My Caps ({capsArray.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={viewMode === 'grid'}
              onPressedChange={() => setViewMode('grid')}
              size="sm"
            >
              <Grid3X3 className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === 'list'}
              onPressedChange={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={onCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Cap
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search caps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {uniqueTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortField}
          onValueChange={(value: SortField) => setSortField(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="updatedAt">Updated</SelectItem>
            <SelectItem value="tag">Tag</SelectItem>
            <SelectItem value="version">Version</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={toggleSortOrder}>
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Caps grid/list */}
      {filteredAndSortedCaps.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-muted-foreground">
              No matching caps
            </CardTitle>
            <CardDescription>
              Try adjusting your search or filter criteria
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <DashboardGrid cols={viewMode === 'grid' ? 3 : 1}>
          {filteredAndSortedCaps.map((cap) => (
            <CapCard
              key={cap.id}
              cap={cap}
              onEdit={() => onEditCap?.(cap)}
              onDebug={() => onDebugCap?.(cap)}
              onSubmit={() => onSubmitCap?.(cap)}
              viewMode={viewMode}
            />
          ))}
        </DashboardGrid>
      )}
    </div>
  );
}

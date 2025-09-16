import {
  CheckSquare,
  ChevronDown,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Progress,
} from '@/shared/components/ui';
import { useSubmitCap } from '../../hooks';
import { CapStudioStore } from '../../stores';
import type { LocalCap } from '../../types';
import { DashboardGrid } from '../layout/dashboard-layout';
import { CapCard } from './cap-card';

interface MyCapsProps {
  onEditCap?: (cap: LocalCap) => void;
  onTestCap?: (cap: LocalCap) => void;
  onSubmitCap?: (cap: LocalCap) => void;
  onCreateNew?: () => void;
  onBulkDelete?: (caps: LocalCap[]) => void;
}

export function MyCaps({
  onEditCap,
  onTestCap,
  onSubmitCap,
  onCreateNew,
  onBulkDelete,
}: MyCapsProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { localCaps, deleteCap } = CapStudioStore();
  const { bulkSubmitCaps, bulkProgress } = useSubmitCap();

  // Multi-select state
  const [selectedCapIds, setSelectedCapIds] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Multi-select handlers
  const toggleCapSelection = (capId: string) => {
    setSelectedCapIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(capId)) {
        newSet.delete(capId);
      } else {
        newSet.add(capId);
      }
      return newSet;
    });
  };

  const enterMultiSelectMode = () => {
    setIsMultiSelectMode(true);
  };

  const selectAllCaps = () => {
    setSelectedCapIds(new Set(allCaps.map((cap) => cap.id)));
  };

  const clearSelection = () => {
    setSelectedCapIds(new Set());
    setIsMultiSelectMode(false);
  };

  const handleBulkDelete = () => {
    const selectedCaps = allCaps.filter((cap) => selectedCapIds.has(cap.id));
    selectedCaps.forEach((cap) => {
      deleteCap(cap.id);
    });
    if (onBulkDelete) {
      onBulkDelete(selectedCaps);
    }
    clearSelection();
  };
  console.log('selectedCapIds', selectedCapIds);

  const handleBulkPublish = async () => {
    const selectedCaps = allCaps.filter((cap) => selectedCapIds.has(cap.id));
    try {
      await bulkSubmitCaps(selectedCaps);
      clearSelection();
    } catch (error) {
      console.error('Bulk publish failed:', error);
    }
  };

  // Get and filter all caps
  const allCaps = useMemo(() => {
    if (!searchQuery) return localCaps;

    const query = searchQuery.toLowerCase();
    return localCaps.filter(
      (cap) =>
        cap.capData.metadata.displayName.toLowerCase().includes(query) ||
        cap.capData.metadata.description.toLowerCase().includes(query) ||
        cap.capData.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        ),
    );
  }, [localCaps, searchQuery]);

  const selectedCaps = allCaps.filter((cap) => selectedCapIds.has(cap.id));
  const hasSelectedCaps = selectedCaps.length > 0;

  if (localCaps.length === 0) {
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
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onCreateNew} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Cap
            </Button>
            <Button
              onClick={() => navigate('/cap-studio/batch-create')}
              variant="outline"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Batch Create
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk submission progress bar */}
      {bulkProgress.isSubmitting && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
                  Publishing Caps ({bulkProgress.completed}/{bulkProgress.total}
                  )
                </CardTitle>
                {bulkProgress.currentCap && (
                  <CardDescription className="text-xs text-blue-600 dark:text-blue-300">
                    Currently publishing: {bulkProgress.currentCap}
                  </CardDescription>
                )}
              </div>
            </div>
            <Progress
              value={(bulkProgress.completed / bulkProgress.total) * 100}
              className="w-full"
            />
          </CardHeader>
        </Card>
      )}

      {/* Error display */}
      {bulkProgress.errors.length > 0 && !bulkProgress.isSubmitting && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm text-red-800 dark:text-red-200">
              Bulk Publish Errors ({bulkProgress.errors.length})
            </CardTitle>
            <div className="space-y-2 mt-2">
              {bulkProgress.errors.map((error) => (
                <div
                  key={error.capName}
                  className="text-xs text-red-600 dark:text-red-300"
                >
                  <strong>{error.capName}:</strong> {error.error}
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Header with controls */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center">
          {!isMultiSelectMode ? (
            <>
              <Button onClick={onCreateNew} className="rounded-r-none w-32">
                <Plus className="h-4 w-4 mr-2" />
                New Cap
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="focus:ring-0 focus:ring-transparent focus:ring-offset-0"
                >
                  <Button className="rounded-l-none border-l-0 px-2 w-10">
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => navigate('/cap-studio/batch-create')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Batch Create
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button onClick={clearSelection} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={selectAllCaps}
                variant="outline"
                size="sm"
                disabled={allCaps.length === selectedCapIds.size}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All ({allCaps.length})
              </Button>
              {selectedCapIds.size > 0 && (
                <>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedCapIds.size})
                  </Button>
                  {hasSelectedCaps && (
                    <Button
                      onClick={handleBulkPublish}
                      variant="default"
                      size="sm"
                      disabled={bulkProgress.isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {bulkProgress.isSubmitting
                        ? `Publishing... (${bulkProgress.completed}/${bulkProgress.total})`
                        : `Publish (${selectedCaps.length})`}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search caps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* All */}
      {allCaps.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-muted-foreground">
              {searchQuery ? 'No matching caps found' : 'No caps yet'}
            </CardTitle>
            <CardDescription>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Create your first cap to get started'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <DashboardGrid cols={1}>
          {allCaps.map((cap) => (
            <CapCard
              key={cap.id}
              cap={cap}
              onEdit={() => onEditCap?.(cap)}
              onTest={() => onTestCap?.(cap)}
              onSubmit={() => onSubmitCap?.(cap)}
              onUpdate={() => onSubmitCap?.(cap)}
              isMultiSelectMode={isMultiSelectMode}
              isSelected={selectedCapIds.has(cap.id)}
              onToggleSelect={() => toggleCapSelection(cap.id)}
              onEnterMultiSelectMode={() => {
                enterMultiSelectMode();
                toggleCapSelection(cap.id);
              }}
            />
          ))}
        </DashboardGrid>
      )}
    </div>
  );
}

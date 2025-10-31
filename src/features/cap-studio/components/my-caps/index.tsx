import {
  CheckSquare,
  ChevronDown,
  FileUp,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { agent8004ToCap } from '@/erc8004/8004-remotecap-adapter';
import { parseYaml } from '@/features/cap-studio/utils/yaml';
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
import { useAuth } from '@/shared/hooks';
import { type Cap, CapSchema } from '@/shared/types';
import { Agent8004Schema } from '@/shared/types/8004-agent';
import { useSubmitCap } from '../../hooks';
import { CapStudioStore } from '../../stores';
import type { LocalCap } from '../../types';
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
  const { did } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { localCaps, deleteCap, createCap } = CapStudioStore();
  const { bulkSubmitCaps, bulkProgress } = useSubmitCap();
  const importFileRef = useRef<HTMLInputElement>(null);
  const importJsonRef = useRef<HTMLInputElement>(null);

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
    const query = searchQuery.toLowerCase();
    const filteredCaps = !searchQuery
      ? localCaps
      : localCaps.filter(
        (cap) =>
          cap.capData.metadata.displayName.toLowerCase().includes(query) ||
          cap.capData.metadata.description.toLowerCase().includes(query) ||
          cap.capData.metadata.tags.some((tag) =>
            tag.toLowerCase().includes(query),
          ),
      );

    const liveCaps = filteredCaps.filter((cap) => Boolean(cap.liveSource?.url));
    const otherCaps = filteredCaps.filter((cap) => !cap.liveSource?.url);

    return [...liveCaps, ...otherCaps];
  }, [localCaps, searchQuery]);

  const selectedCaps = allCaps.filter((cap) => selectedCapIds.has(cap.id));
  const hasSelectedCaps = selectedCaps.length > 0;

  // Build a full Cap object by injecting id and authorDID, then validate via CapSchema
  const buildAndValidateCap = (capData: any): Cap => {
    const partial = capData as Omit<Cap, 'id' | 'authorDID'>;
    const normalizeAuthorDid = (raw?: string | null): string => {
      if (!raw) return 'did::unknown';
      if (raw.startsWith('did::')) return raw;
      if (raw.startsWith('did:')) return `did::${raw.slice(4)}`;
      return `did::${raw}`;
    };

    const authorDID = normalizeAuthorDid(did);

    const fullCap: Cap = {
      id: `${authorDID}:${partial.idName}`,
      authorDID,
      ...partial,
    } as Cap;

    CapSchema.parse(fullCap);
    return fullCap;
  };

  const handleImportYaml = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // if (!did) {
    //   toast.error('Please sign in to import a cap');
    //   return;
    // }

    try {
      const text = await file.text();
      const data = parseYaml(text);

      if (Array.isArray(data)) {
        toast.error(
          'This file contains multiple caps. Use Batch Create instead.',
        );
        return;
      }

      const validated = buildAndValidateCap(data);
      const created = createCap(validated);
      toast.success(`Imported "${created.capData.metadata.displayName}"`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to import cap';
      toast.error(message);
    } finally {
      // reset input to allow importing the same file again if needed
      event.target.value = '';
    }
  };

  const handleImportJson = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Validate against 8004 Agent schema
      const agent = Agent8004Schema.parse(data);

      // Normalize author DID (same logic as YAML import)
      const normalizeAuthorDid = (raw?: string | null): string => {
        if (!raw) return 'did::unknown';
        if (raw.startsWith('did::')) return raw;
        if (raw.startsWith('did:')) return `did::${raw.slice(4)}`;
        return `did::${raw}`;
      };
      const authorDID = normalizeAuthorDid(did);

      // Map to Cap using existing adapter
      const mappedCap = agent8004ToCap(agent as any, {
        authorDID,
      });

      CapSchema.parse(mappedCap);
      const created = createCap(mappedCap);
      toast.success(`Imported "${created.capData.metadata.displayName}"`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to import JSON';
      toast.error(message);
    } finally {
      event.target.value = '';
    }
  };

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
            {/**
             * Temporarily disable YAML import in Cap Studio
             * <Button
             *   onClick={() => importFileRef.current?.click()}
             *   variant="outline"
             *   size="lg"
             * >
             *   <Upload className="h-4 w-4 mr-2" />
             *   Import YAML
             * </Button>
             */}
            <Button
              onClick={() => importJsonRef.current?.click()}
              variant="outline"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import 8004 JSON
            </Button>
            {/**
             * Hidden input for YAML import disabled
             * <input
             *   ref={importFileRef}
             *   type="file"
             *   accept=".yaml,.yml"
             *   onChange={handleImportYaml}
             *   className="hidden"
             * />
             */}
            {/* Hidden input for importing a single 8004 JSON */}
            <input
              ref={importJsonRef}
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
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
                <DropdownMenuContent align="end" className="w-42">
                  {/* Hide the batch create for now */}
                  {/* <DropdownMenuItem
                    onClick={() => navigate('/cap-studio/batch-create')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Batch Create
                  </DropdownMenuItem> */}
                  {/**
                   * Temporarily disable YAML import
                   * <DropdownMenuItem
                   *   onClick={() => importFileRef.current?.click()}
                   * >
                   *   <FileUp className="h-4 w-4 mr-2" />
                   *   Import from YAML
                   * </DropdownMenuItem>
                   */}
                  <DropdownMenuItem
                    onClick={() => importJsonRef.current?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Import from 8004 JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/**
               * Hidden input for YAML import disabled
               * <input
               *   ref={importFileRef}
               *   type="file"
               *   accept=".yaml,.yml"
               *   onChange={handleImportYaml}
               *   className="hidden"
               * />
               */}
              {/* Hidden input for importing a single 8004 JSON */}
              <input
                ref={importJsonRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
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
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[calc(100vh-250px)] hide-scrollbar">
          {allCaps.map((cap) => (
            <CapCard
              key={cap.id}
              cap={cap}
              onTest={() => onTestCap?.(cap)}
              onSubmit={() => onSubmitCap?.(cap)}
              isMultiSelectMode={isMultiSelectMode}
              isSelected={selectedCapIds.has(cap.id)}
              onToggleSelect={() => {
                // If not already in multi-select, enter it when the checkbox is clicked
                if (!isMultiSelectMode) setIsMultiSelectMode(true);
                toggleCapSelection(cap.id);
              }}
              onEnterMultiSelectMode={() => onEditCap?.(cap)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

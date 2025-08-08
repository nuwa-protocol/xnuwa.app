import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import { useLocalCaps } from '../../hooks';
import type { LocalCap } from '../../types';
import { DashboardGrid } from '../layout/dashboard-layout';
import { CapCard } from './cap-card';

interface MyCapsProps {
  onEditCap?: (cap: LocalCap) => void;
  onTestCap?: (cap: LocalCap) => void;
  onSubmitCap?: (cap: LocalCap) => void;
  onCreateNew?: () => void;
}

export function MyCaps({
  onEditCap,
  onTestCap,
  onSubmitCap,
  onCreateNew,
}: MyCapsProps) {
  const localCaps = useLocalCaps();
  const [searchQuery, setSearchQuery] = useState('');

  // Get caps array
  const capsArray = localCaps;

  // Separate caps by status
  const draftCaps = useMemo(() => {
    const drafts = capsArray.filter((cap) => cap.status === 'draft');
    if (!searchQuery) return drafts;

    const query = searchQuery.toLowerCase();
    return drafts.filter(
      (cap) =>
        cap.capData.metadata.displayName.toLowerCase().includes(query) ||
        cap.capData.metadata.description.toLowerCase().includes(query) ||
        cap.capData.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        ),
    );
  }, [capsArray, searchQuery]);

  const publishedCaps = useMemo(() => {
    const published = capsArray.filter((cap) => cap.status === 'submitted');
    if (!searchQuery) return published;

    const query = searchQuery.toLowerCase();
    return published.filter(
      (cap) =>
        cap.capData.metadata.displayName.toLowerCase().includes(query) ||
        cap.capData.metadata.description.toLowerCase().includes(query) ||
        cap.capData.metadata.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        ),
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

      {/* Tabs for draft and published */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drafts">Drafts ({draftCaps.length})</TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedCaps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="mt-6">
          {draftCaps.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center py-8">
                <CardTitle className="text-muted-foreground">
                  {searchQuery ? 'No matching draft caps' : 'No draft caps'}
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
              {draftCaps.map((cap) => (
                <CapCard
                  key={cap.id}
                  cap={cap}
                  onEdit={() => onEditCap?.(cap)}
                  onTest={() => onTestCap?.(cap)}
                  onSubmit={() => onSubmitCap?.(cap)}
                />
              ))}
            </DashboardGrid>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedCaps.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-center py-8">
                <CardTitle className="text-muted-foreground">
                  {searchQuery
                    ? 'No matching published caps'
                    : 'No published caps'}
                </CardTitle>
                <CardDescription>
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'Submit your drafts to see them here'}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <DashboardGrid cols={1}>
              {publishedCaps.map((cap) => (
                <CapCard
                  key={cap.id}
                  cap={cap}
                  onEdit={() => onEditCap?.(cap)}
                  onTest={() => onTestCap?.(cap)}
                  onUpdate={() => onSubmitCap?.(cap)}
                />
              ))}
            </DashboardGrid>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

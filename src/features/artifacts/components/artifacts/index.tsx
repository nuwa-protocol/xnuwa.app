import {
  ArrowDownWideNarrow,
  Clock,
  Package,
  Search,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtifactSessionsStore } from '@/features/artifacts/stores';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';

type SortKey = 'updatedAt' | 'createdAt' | 'title';
type SortOrder = 'asc' | 'desc';

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

function getHostname(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return 'local';
  }
}

export default function Artifacts() {
  const navigate = useNavigate();
  const { getAllArtifactSessions } = ArtifactSessionsStore();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const artifacts = useMemo(() => {
    const list = getAllArtifactSessions();
    const filtered = query
      ? list.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()))
      : list;
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = (a[sortBy] as number) - (b[sortBy] as number);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [getAllArtifactSessions, query, sortBy, sortOrder]);

  const handleOpen = (id: string) => {
    navigate(`/artifact?artifact_id=${id}`);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <div className="text-base font-semibold leading-tight">
                My Artifacts
              </div>
              <div className="text-xs text-muted-foreground">
                {artifacts.length} item{artifacts.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artifacts..."
                className="h-9 w-full rounded-md bg-accent pl-10 pr-3 text-sm placeholder:text-muted-foreground/60 focus-visible:bg-background"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9">
                  <ArrowDownWideNarrow className="mr-2 size-4" />
                  {sortBy === 'title'
                    ? 'Title'
                    : sortBy === 'createdAt'
                      ? 'Created'
                      : 'Updated'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                  Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                  Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('title')}>
                  Title
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem
                  onClick={() =>
                    setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                  }
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-64px)]">
        {/* subtract header approx height */}
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          {artifacts.length === 0 ? (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/30">
                <Package className="size-6 text-muted-foreground" />
              </div>
              <div className="text-lg font-medium">No artifacts yet</div>
              <div className="max-w-md text-sm text-muted-foreground">
                Artifacts you create or save will show up here.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {artifacts.map((a) => (
                <Card
                  key={a.id}
                  className="group cursor-pointer transition-colors hover:bg-accent/40"
                  onClick={() => handleOpen(a.id)}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-base">
                      {a.title || 'Untitled artifact'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                        {getHostname(a.artifact.core.source)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" /> Updated{' '}
                        {formatDate(a.updatedAt)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div>Created {formatDate(a.createdAt)}</div>
                      <div className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <span>Open</span>
                        <SquareArrowOutUpRight className="size-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

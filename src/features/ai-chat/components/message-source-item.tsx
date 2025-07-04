import { ExternalLinkIcon, Globe } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface MessageSourceItemProps {
  source: {
    id?: string;
    title?: string;
    url?: string;
  };
  index: number;
  onSourceClick: (url: string) => void;
}

interface UrlMetadata {
  title?: string;
  description?: string;
  image?: string;
  logo?: string;
  url?: string;
  publisher?: string;
}

export const MessageSourceItem = ({
  source,
  index,
  onSourceClick,
}: MessageSourceItemProps) => {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  // todo: need to fix the cors issue here
  // useEffect(() => {
  //   const fetchMetadata = async () => {
  //     setLoading(true);
  //     const metadata = await urlMetadata(source.url || '');
  //     setMetadata(metadata);
  //     setLoading(false);
  //   };
  //   fetchMetadata();
  // }, [source.url]);

  const title = metadata?.title || source.title || 'Untitled Source';
  const url = source.url || '';
  const id = source.id || 'unknown';
  const isExternalUrl = url.startsWith('http');

  if (isExternalUrl && url) {
    return (
      <Button
        key={`source-${index}-${id}`}
        variant="ghost"
        className="flex items-start gap-3 p-3 h-auto justify-start rounded-md w-full min-w-0"
        onClick={() => onSourceClick(url)}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1 overflow-hidden">
          {loading ? (
            <Skeleton className="w-6 h-6 rounded flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-6 h-6 flex-shrink-0 mt-0.5 rounded overflow-hidden bg-muted">
              {metadata?.logo ? (
                <img
                  src={metadata.logo}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground m-1" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs flex-shrink-0">
                #{index + 1}
              </Badge>
              <span className="font-medium text-sm truncate flex-shrink">
                {loading ? <Skeleton className="h-4 w-24" /> : title}
              </span>
            </div>

            {metadata?.description && !loading && (
              <p
                className="text-xs text-muted-foreground mb-1"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {metadata.description}
              </p>
            )}

            {url && (
              <span className="text-xs text-muted-foreground truncate block">
                {new URL(url).hostname}
              </span>
            )}
          </div>
        </div>

        <ExternalLinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-1" />
      </Button>
    );
  }

  return (
    <div
      key={`source-${index}-${id}`}
      className="flex items-center gap-3 p-2 rounded-md min-w-0"
    >
      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />

      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <Badge variant="outline" className="text-xs flex-shrink-0">
          #{id}
        </Badge>

        <span className="font-medium text-sm truncate flex-shrink">
          {title}
        </span>

        {url && (
          <span className="text-xs text-muted-foreground truncate flex-shrink min-w-0">
            • {url}
          </span>
        )}
      </div>
    </div>
  );
};

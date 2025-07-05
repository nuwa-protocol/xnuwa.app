import { ExternalLinkIcon, Globe } from 'lucide-react';
import { useState } from 'react';
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
      <button
        type="button"
        key={`source-${index}-${id}`}
        className="group flex items-start gap-3 p-2 hover:bg-muted/20 transition-all duration-200 rounded cursor-pointer border border-transparent hover:border-border/30"
        onClick={() => onSourceClick(url)}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1 overflow-hidden">
          {loading ? (
            <Skeleton className="w-4 h-4 rounded flex-shrink-0 mt-1" />
          ) : (
            <div className="w-4 h-4 flex-shrink-0 mt-1 rounded overflow-hidden bg-muted/50">
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
                <Globe className="w-3 h-3 text-muted-foreground/70 m-0.5" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-4 text-[10px] text-muted-foreground/60 font-mono flex-shrink-0 flex items-center">
                {index + 1}
              </span>
              <span className="font-medium text-sm truncate flex-shrink text-foreground/90 group-hover:text-foreground transition-colors">
                {loading ? <Skeleton className="h-4 w-24" /> : title}
              </span>
            </div>

            {metadata?.description && !loading && (
              <p
                className="text-xs text-muted-foreground/80 mb-1 ml-7"
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
              <span className="text-xs text-muted-foreground/60 truncate block ml-7">
                {new URL(url).hostname}
              </span>
            )}
          </div>
        </div>

        <ExternalLinkIcon className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground/70 flex-shrink-0 mt-1 transition-colors" />
      </button>
    );
  }

  return (
    <div
      key={`source-${index}-${id}`}
      className="flex items-center gap-3 p-2 rounded-md min-w-0 hover:bg-muted/20 transition-colors"
    >
      <Globe className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />

      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
        <span className="w-5 h-4 text-[10px] text-muted-foreground/60 font-mono flex-shrink-0 flex items-center">
          {index + 1}
        </span>

        <span className="font-medium text-sm truncate flex-shrink text-foreground/90">
          {title}
        </span>

        {url && (
          <span className="text-xs text-muted-foreground/60 truncate flex-shrink min-w-0">
            • {url}
          </span>
        )}
      </div>
    </div>
  );
};

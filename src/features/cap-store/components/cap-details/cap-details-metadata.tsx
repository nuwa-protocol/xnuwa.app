import { Copy, GitBranch, Package, Shield, User, Fingerprint } from 'lucide-react';
import { Badge, Card, CardHeader, CardTitle, CardContent, Tooltip, TooltipTrigger, TooltipProvider, TooltipContent, Button } from '@/shared/components/ui';
import type { RemoteCap } from '../../types';

interface CapDetailsMetadataProps {
  capQueryData: RemoteCap;
  downloadedCapData: any;
}

export function CapDetailsMetadata({
  capQueryData,
  downloadedCapData,
}: CapDetailsMetadataProps) {
  const truncateAuthor = (did: string) => {
    if (did.length > 20) {
      return `${did.slice(0, 10)}...${did.slice(-10)}`;
    }
    return did;
  };

  const metadataItems = [
    {
      icon: User,
      label: 'Author',
      value: truncateAuthor(downloadedCapData.authorDID),
      copyable: downloadedCapData.authorDID,
    },
    {
      icon: GitBranch,
      label: 'Version',
      value: `v${capQueryData.version}`,
      badge: true,
    },
    {
      icon: Fingerprint,
      label: 'CID',
      value: capQueryData.cid,
      copyable: capQueryData.cid,
    },
    {
      icon: Shield,
      label: 'Status',
      value: 'Verified',
      badge: true,
      variant: 'success',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" /> Metadata
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metadataItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                {item.badge ? (
                  <Badge
                    variant={item.variant === 'success' ? 'default' : 'secondary'}
                    className={
                      item.variant === 'success'
                        ? 'bg-green-500 hover:bg-green-600'
                        : ''
                    }
                  >
                    {item.value}
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm break-all">{item.value}</p>
                    {item.copyable && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => {
                                navigator.clipboard.writeText(item.copyable as string);
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy to clipboard</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

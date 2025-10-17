import { formatDistanceToNow } from 'date-fns';
import {
  Bot,
  Bug,
  Check,
  Clock,
  Copy,
  Download,
  Loader2,
  MoreVertical,
  PlayCircle,
  Server,
  Share,
  StopCircle,
  Trash2,
  Upload,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CapAvatar } from '@/shared/components/cap-avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  CodeBlock,
  CodeBlockCopyButton,
} from '@/shared/components/ui/shadcn-io/code-block';
import { ShareDialog } from '@/shared/components/ui/shadcn-io/share-dialog';
import { APP_URL } from '@/shared/config/app';
import { stringifyYaml } from '@/features/cap-studio/utils/yaml';
import { CapStudioStore } from '../../stores';
import type { LocalCap } from '../../types';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { LiveDebugCapDialog } from './live-debug-cap-dialog';

interface CapCardProps {
  cap: LocalCap;
  onTest?: () => void;
  onSubmit?: () => void;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEnterMultiSelectMode?: () => void;
}

export function CapCard({
  cap,
  onTest,
  onSubmit,
  isMultiSelectMode,
  isSelected,
  onToggleSelect,
  onEnterMultiSelectMode,
}: CapCardProps) {
  const { deleteCap, updateCap } = CapStudioStore();
  const currentCap = CurrentCapStore((state) => state.currentCap);
  const setCurrentCap = CurrentCapStore((state) => state.setCurrentCap);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const suppressCardClickUntilRef = useRef<number>(0); // suppress accidental card click after dialog closes
  const [isStoppingLiveDebug, setIsStoppingLiveDebug] = useState(false);
  const [isLiveDebugDialogOpen, setIsLiveDebugDialogOpen] = useState(false);
  const [liveDebugSourceUrl, setLiveDebugSourceUrl] = useState('');
  const [isStartingLiveDebug, setIsStartingLiveDebug] = useState(false);

  // Build the exportable YAML once per cap change (omit id/authorDID)
  const exportYaml = useMemo(() => {
    try {
      const {
        id: _omitId,
        authorDID: _omitAuthor,
        ...exportCap
      } = (cap.capData as any) || {};
      return stringifyYaml(exportCap);
    } catch {
      return '{}';
    }
  }, [cap.capData]);

  const isLiveDebugging = Boolean(cap.liveSource?.url);

  const handleDelete = () => {
    deleteCap(cap.id);
    setShowDeleteDialog(false);
  };

  const handleCopyCid = async () => {
    if (cap.cid) {
      await navigator.clipboard.writeText(cap.cid);
      toast.success(`Published CID copied: ${cap.cid}`);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelect) {
      onToggleSelect();
    }
  };

  const handleCardClick = () => {
    // Prevent opening edit immediately after closing the export dialog (ghost click)
    if (Date.now() < suppressCardClickUntilRef.current) return;
    if (isLiveDebugDialogOpen) return;
    if (isLiveDebugging && !isMultiSelectMode) return;
    if (!isMultiSelectMode && onEnterMultiSelectMode) {
      onEnterMultiSelectMode();
    } else if (isMultiSelectMode && onToggleSelect) {
      onToggleSelect();
    }
  };

  const mcpServerCount = Object.keys(cap.capData.core.mcpServers).length;
  const lastUpdated = formatDistanceToNow(new Date(cap.updatedAt), {
    addSuffix: true,
  });

  // Trigger the dialog that previews export YAML
  const handleOpenExportDialog = () => {
    setExportDialogOpen(true);
  };

  // Save the YAML to file (used by dialog "Save YAML")
  const handleDownloadYaml = () => {
    try {
      const blob = new Blob([exportYaml], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cap.capData.idName}.yaml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Exported cap YAML');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export cap YAML');
    }
  };

  // Centralize open state changes to also set a short suppression window on close
  const handleExportDialogOpenChange = (open: boolean) => {
    setExportDialogOpen(open);
    if (!open) {
      suppressCardClickUntilRef.current = Date.now() + 300;
    }
  };

  const syncCurrentCapLiveSource = (
    nextLiveSource?: LocalCap['liveSource'],
  ) => {
    if (
      currentCap &&
      'capData' in currentCap &&
      currentCap.id === cap.id
    ) {
      setCurrentCap({
        ...currentCap,
        liveSource: nextLiveSource,
        updatedAt: Date.now(),
      });
    }
  };

  const handleStartLiveDebug = () => {
    const trimmedUrl = liveDebugSourceUrl.trim();
    if (!trimmedUrl) {
      toast.error('Please enter a valid source URL.');
      return;
    }

    setIsStartingLiveDebug(true);
    try {
      const nextLiveSource: LocalCap['liveSource'] = { url: trimmedUrl };
      updateCap(cap.id, { liveSource: nextLiveSource });
      syncCurrentCapLiveSource(nextLiveSource);
      toast.success('Live debugging started.');
      setIsLiveDebugDialogOpen(false);
    } catch (error) {
      console.error('Failed to start live debugging:', error);
      toast.error('Failed to start live debugging. Please try again.');
    } finally {
      setIsStartingLiveDebug(false);
    }
  };

  const handleStopLiveDebug = () => {
    setIsStoppingLiveDebug(true);
    try {
      updateCap(cap.id, { liveSource: undefined });
      syncCurrentCapLiveSource(undefined);
      const latestCurrent = CurrentCapStore.getState().currentCap;
      if (
        latestCurrent &&
        'capData' in latestCurrent &&
        latestCurrent.id === cap.id
      ) {
        setCurrentCap(latestCurrent);
      }
      toast.success('Live debugging stopped.');
    } catch (error) {
      console.error('Failed to stop live debugging:', error);
      toast.error('Failed to stop live debugging. Please try again.');
    } finally {
      setIsStoppingLiveDebug(false);
    }
  };

  const handleOpenLiveDebugDialog = () => {
    setLiveDebugSourceUrl(cap.liveSource?.url ?? '');
    setIsLiveDebugDialogOpen(true);
  };

  // Determine border color based on published status
  const borderColor = isLiveDebugging
    ? 'border-l-amber-400 dark:border-l-amber-500'
    : cap.status === 'submitted'
      ? 'border-l-theme-primary/50'
      : 'border-l-primary/20';

  return (
    <Card
      className={`
        hover:shadow-md transition-all duration-200 border-l-4 
        ${borderColor}
        ${isLiveDebugging && !isMultiSelectMode ? 'cursor-default' : 'cursor-pointer'}
        ${isLiveDebugging ? 'border border-amber-200/70 bg-amber-50/40 dark:border-amber-500/60 dark:bg-amber-500/5' : ''}
        group
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {(isMultiSelectMode || isHovered) && (
            <div className="flex items-center">
              <button
                type="button"
                className={`
                  w-4 h-4 border-2 rounded flex items-center justify-center transition-all
                  ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}
                  ${!isMultiSelectMode && isHovered ? 'opacity-70 hover:opacity-100' : ''}
                `}
                onClick={handleSelectClick}
              >
                {isSelected && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </button>
            </div>
          )}
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <CapAvatar cap={cap} size="3xl" className="rounded-md" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-base truncate">
                  {cap.capData.metadata.displayName}
                </h3>
                {isLiveDebugging && (
                  <Badge className="shrink-0 bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-400/20 dark:text-amber-100 dark:border-amber-300 uppercase tracking-wide">
                    Live Debugging
                  </Badge>
                )}
                {cap.status === 'submitted' && (
                  <Badge className="shrink-0 bg-theme-primary/10 text-theme-primary">
                    Published
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-2 break-words overflow-hidden">
                {cap.capData.metadata.description}
              </p>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center">
                  <Bot className="h-3 w-3 mr-1" />
                  {cap.capData.core.model.modelId}
                </div>
                <div className="flex items-center">
                  <Server className="h-3 w-3 mr-1" />
                  {mcpServerCount} MCP server{mcpServerCount !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUpdated}
                </div>
              </div>
            </div>
          </div>

          {!isMultiSelectMode && (
            <div className="flex items-center space-x-2 shrink-0">
              <div className="flex grid grid-cols-1 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTest?.();
                  }}
                  size="sm"
                  className="w-full"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Test Cap
                </Button>
                {isLiveDebugging ? (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopLiveDebug();
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-200 dark:border-amber-400 dark:hover:bg-amber-500/20"
                    disabled={isStoppingLiveDebug}
                  >
                    {isStoppingLiveDebug ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <StopCircle className="h-4 w-4 mr-2" />
                    )}
                    Stop Live Debug
                  </Button>
                ) : cap.status === 'submitted' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubmit?.();
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Publish
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">
                      Publishing again will update this cap.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubmit?.();
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {cap.id && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareDialogOpen(true);
                      }}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}

                  {cap.status === 'submitted' && cap.cid && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyCid();
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Published CID
                    </DropdownMenuItem>
                  )}

                  {(cap.id ||
                    (cap.status === 'submitted' && cap.cid)) && (
                    <DropdownMenuSeparator />
                  )}

                  {!isLiveDebugging && (
                    <>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLiveDebugDialog();
                        }}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Live Debugging
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenExportDialog();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export YAML
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Cap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete @{cap.capData.idName}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        title={`Share ${cap.capData.metadata.displayName}`}
        description="Share this published cap with others using this link."
        links={[
          {
            id: 'share',
            label: 'Share Link',
            url: `${APP_URL}/chat?capid=${cap.id}`,
          },
        ]}
      />

      {/* Export YAML preview dialog with copy/save actions */}
      <Dialog
        open={exportDialogOpen}
        onOpenChange={handleExportDialogOpenChange}
      >
        <DialogContent
          className="sm:max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Export YAML</DialogTitle>
            <DialogDescription>
              Preview and copy or save the YAML for @{cap.capData.idName}
            </DialogDescription>
          </DialogHeader>

          <CodeBlock
            code={exportYaml}
            language="yaml"
            className="max-h-[60vh] overflow-auto"
          >
            <CodeBlockCopyButton
              onCopy={() => toast.success('YAML copied to clipboard')}
              onError={() => toast.error('Failed to copy YAML')}
              title="Copy YAML"
            />
          </CodeBlock>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => handleExportDialogOpenChange(false)}
            >
              Close
            </Button>
            <Button onClick={handleDownloadYaml}>
              <Download className="h-4 w-4 mr-2" />
              Save YAML
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LiveDebugCapDialog
        open={isLiveDebugDialogOpen}
        onOpenChange={(open) => {
          setIsLiveDebugDialogOpen(open);
          if (!open) {
            setLiveDebugSourceUrl(cap.liveSource?.url ?? '');
            setIsStartingLiveDebug(false);
            suppressCardClickUntilRef.current = Date.now() + 300;
          }
        }}
        url={liveDebugSourceUrl}
        onUrlChange={setLiveDebugSourceUrl}
        expectedIdName={cap.capData.idName}
        onSubmit={handleStartLiveDebug}
        onCancel={() => {
          setIsLiveDebugDialogOpen(false);
          setLiveDebugSourceUrl(cap.liveSource?.url ?? '');
          setIsStartingLiveDebug(false);
          suppressCardClickUntilRef.current = Date.now() + 300;
        }}
        isSubmitting={isStartingLiveDebug}
      />
    </Card>
  );
}

import { formatDistanceToNow } from 'date-fns';
import {
  Bot,
  Bug,
  Clock,
  Copy,
  Edit,
  MoreVertical,
  Server,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import type { LocalCap } from '../../types';

interface CapCardProps {
  cap: LocalCap;
  onEdit?: () => void;
  onTest?: () => void;
  onSubmit?: () => void;
  onUpdate?: () => void;
}

export function CapCard({
  cap,
  onEdit,
  onTest,
  onSubmit,
  onUpdate,
}: CapCardProps) {
  const { deleteCap } = useLocalCapsHandler();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const mcpServerCount = Object.keys(cap.capData.core.mcpServers).length;
  const lastUpdated = formatDistanceToNow(new Date(cap.updatedAt), {
    addSuffix: true,
  });

  return (
    <Card className="hover:shadow-md hover:shadow-theme-primary/40 shadow-theme-primary/20 transition-all duration-200 border-l-4 border-l-theme-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Avatar className="rounded-lg">
                <AvatarImage
                  src={
                    cap.capData.metadata.thumbnail?.type === 'file'
                      ? cap.capData.metadata.thumbnail.file
                      : cap.capData.metadata.thumbnail?.url
                  }
                />
                <AvatarFallback>
                  {cap.capData.metadata.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-base truncate">
                  {cap.capData.metadata.displayName}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-2 break-words overflow-hidden">
                {cap.capData.metadata.description}
              </p>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center">
                  <Bot className="h-3 w-3 mr-1" />
                  {cap.capData.core.model.name}
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

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex grid grid-cols-2 gap-2">
              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button onClick={onTest} size="sm" variant="outline">
                <Bug className="h-4 w-4 mr-2" />
                Test Cap
              </Button>

              {cap.status === 'draft' ? (
                <Button
                  onClick={onSubmit}
                  size="sm"
                  variant="default"
                  className="col-span-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit for Publishing
                </Button>
              ) : (
                <Button
                  onClick={onUpdate}
                  size="sm"
                  variant="default"
                  className="col-span-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Update Published Version
                </Button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {cap.status === 'submitted' && cap.cid && (
                  <>
                    <DropdownMenuItem onClick={handleCopyCid}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Published CID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    </Card>
  );
}

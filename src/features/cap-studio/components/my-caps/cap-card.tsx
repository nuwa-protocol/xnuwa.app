import { formatDistanceToNow } from 'date-fns';
import {
  Bug,
  CheckCircle,
  Clock,
  Code2,
  Copy,
  Edit,
  FileText,
  MoreVertical,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
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
} from '@/shared/components/ui';
import { useLocalCapsHandler } from '../../hooks/use-local-caps-handler';
import type { LocalCap } from '../../types';

interface CapCardProps {
  cap: LocalCap;
  onEdit?: () => void;
  onTest?: () => void;
  onSubmit?: () => void;
  onClick?: () => void;
}

export function CapCard({
  cap,
  onEdit,
  onTest,
  onSubmit,
  onClick,
}: CapCardProps) {
  const { deleteCap } = useLocalCapsHandler();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteCap(cap.id);
    setShowDeleteDialog(false);
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(cap.id);
  };

  const mcpServerCount = Object.keys(cap.mcpServers).length;
  const lastUpdated = formatDistanceToNow(new Date(cap.updatedAt), {
    addSuffix: true,
  });

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-base truncate">{cap.name}</h3>
                <Badge
                  variant={cap.status === 'submitted' ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {cap.status === 'submitted' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <FileText className="h-3 w-3 mr-1" />
                  )}
                  {cap.status === 'submitted' ? 'Published' : 'Draft'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {cap.description}
              </p>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Code2 className="h-3 w-3 mr-1" />
                  {cap.model.name}
                </div>
                <div className="flex items-center">
                  <Settings className="h-3 w-3 mr-1" />
                  {mcpServerCount} MCP server{mcpServerCount !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUpdated}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center space-x-2 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            {cap.status === 'draft' ? (
              <Button onClick={onTest} size="sm" variant="outline">
                <Bug className="h-4 w-4 mr-2" />
                Test
              </Button>
            ) : null}

            <Button
              onClick={cap.status === 'draft' ? onSubmit : onEdit}
              size="sm"
              variant={cap.status === 'draft' ? 'default' : 'outline'}
            >
              {cap.status === 'draft' ? (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {cap.status === 'draft' && (
                  <DropdownMenuItem onClick={onSubmit}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit to Store
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleCopyId}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </button>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cap</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{cap.name}"? This action cannot
              be undone.
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

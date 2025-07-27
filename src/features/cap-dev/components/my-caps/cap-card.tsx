import { formatDistanceToNow } from 'date-fns';
import {
  Bug,
  Clock,
  Code2,
  Copy,
  Edit,
  MoreVertical,
  Settings,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { type LocalCap, useCapDevStore } from '@/features/cap-dev/stores/model-stores';
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
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui';

interface CapCardProps {
  cap: LocalCap;
  onEdit?: () => void;
  onDebug?: () => void;
  onSubmit?: () => void;
  viewMode?: 'grid' | 'list';
}

export function CapCard({
  cap,
  onEdit,
  onDebug,
  onSubmit,
  viewMode = 'grid',
}: CapCardProps) {
  const { deleteCap } = useCapDevStore();
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

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Code2 className="h-6 w-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-base truncate">
                    {cap.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    <Tag className="h-3 w-3 mr-1" />
                    {cap.tag}
                  </Badge>
                  <Badge variant="outline" className="shrink-0">
                    v{cap.version}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {cap.description}
                </p>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {lastUpdated}
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-3 w-3 mr-1" />
                    {mcpServerCount} MCP server{mcpServerCount !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center">
                    <Code2 className="h-3 w-3 mr-1" />
                    {cap.model.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button onClick={onDebug} size="sm" variant="outline">
                <Bug className="h-4 w-4 mr-2" />
                Debug
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onSubmit}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit to Store
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyId}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
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
            </div>
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 ring-1 ring-border hover:ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
            <Code2 className="h-5 w-5 text-primary" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Cap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDebug}>
                <Bug className="h-4 w-4 mr-2" />
                Debug Cap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSubmit}>
                <Upload className="h-4 w-4 mr-2" />
                Submit to Store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </DropdownMenuItem>
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

        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-1">{cap.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {cap.tag}
            </Badge>
            <Badge variant="outline" className="text-xs">
              v{cap.version}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm line-clamp-3 mb-4 min-h-[3rem]">
          {cap.description}
        </CardDescription>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {lastUpdated}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Last updated: {new Date(cap.updatedAt).toLocaleString()}
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              {mcpServerCount} MCP
            </div>
          </div>

          <div className="text-xs text-muted-foreground truncate">
            <Code2 className="h-3 w-3 mr-1 inline" />
            {cap.model.name}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              onClick={onEdit}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-2" />
              Edit
            </Button>
            <Button
              onClick={onDebug}
              size="sm"
              variant="default"
              className="flex-1"
            >
              <Bug className="h-3 w-3 mr-2" />
              Test
            </Button>
          </div>
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

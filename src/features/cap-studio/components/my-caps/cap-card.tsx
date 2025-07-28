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
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { type LocalCap, useCapStudioStore } from '@/features/cap-studio/stores/model-stores';
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
  onTest?: () => void;
  onSubmit?: () => void;
  onClick?: () => void;
  viewMode?: 'grid' | 'list';
}

export function CapCard({
  cap,
  onEdit,
  onTest,
  onSubmit,
  onClick,
  viewMode = 'grid',
}: CapCardProps) {
  const { deleteCap } = useCapStudioStore();
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
                  <h3 className="font-semibold text-base truncate">
                    {cap.name}
                  </h3>
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
                    <Copy className="h-3 w-3 mr-1" />
                    <span className="font-mono text-xs">{cap.id.slice(0, 8)}...</span>
                  </div>
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

            <button type='button' className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
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

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-0 ring-1 ring-border hover:ring-primary/20 cursor-pointer"
      onClick={onClick}
    >
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
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Cap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onTest}>
                <Bug className="h-4 w-4 mr-2" />
                Test Cap
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSubmit}>
                <Upload className="h-4 w-4 mr-2" />
                Submit to Store
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Full ID
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
          <div className="flex items-center space-x-2 flex-wrap">
            <Badge 
              variant={cap.status === 'submitted' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {cap.status === 'submitted' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
              {cap.status === 'submitted' ? 'Published' : 'Draft'}
            </Badge>
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
                  <Copy className="h-3 w-3 mr-1" />
                  <span className="font-mono">{cap.id.slice(0, 8)}...</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Full ID: {cap.id}
              </TooltipContent>
            </Tooltip>

            <div className="flex items-center">
              <Settings className="h-3 w-3 mr-1" />
              {mcpServerCount} MCP
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {lastUpdated}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Last updated: {new Date(cap.updatedAt).toLocaleString()}
            </TooltipContent>
          </Tooltip>

          <div className="text-xs text-muted-foreground truncate">
            <Code2 className="h-3 w-3 mr-1 inline" />
            {cap.model.name}
          </div>

          <button type='button' className="flex items-center space-x-2 pt-2" onClick={(e) => e.stopPropagation()}>
            {cap.status === 'draft' ? (
              <Button onClick={onTest} size="sm" variant="outline" className="flex-1">
                <Bug className="h-3 w-3 mr-2" />
                Test
              </Button>
            ) : null}
            <Button
              onClick={cap.status === 'draft' ? onSubmit : onEdit}
              size="sm"
              variant={cap.status === 'draft' ? 'default' : 'outline'}
              className="flex-1"
            >
              {cap.status === 'draft' ? (
                <>
                  <Upload className="h-3 w-3 mr-2" />
                  Submit
                </>
              ) : (
                <>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </>
              )}
            </Button>
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

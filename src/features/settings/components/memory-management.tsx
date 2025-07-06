'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useMemory } from '@/features/settings/hooks/use-memory';
import { toast } from '@/shared/components';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Textarea,
} from '@/shared/components/ui';
import { formatRelativeTime } from '@/shared/utils';

export function MemoryManagement() {
  const {
    memories,
    deleteMemory,
    clearAllMemories,
    getMemoryCount,
    isLoading,
    addMemory,
    editMemory,
  } = useMemory();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [editMemoryText, setEditMemoryText] = useState('');
  const [editingMemory, setEditingMemory] = useState<{
    id: string;
    createdAt: number;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteMemory = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMemory(id);
      toast({
        type: 'success',
        description: 'Memory deleted successfully',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to delete memory',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllMemories();
      toast({
        type: 'success',
        description: 'All memories cleared successfully',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to clear memories',
      });
    } finally {
      setShowConfirm(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemoryText.trim()) return;

    setIsAdding(true);
    try {
      await addMemory(newMemoryText.trim());
      toast({
        type: 'success',
        description: 'Memory added successfully',
      });
      setNewMemoryText('');
      setShowAddDialog(false);
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to add memory',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEditDialog = (memory: {
    id: string;
    text: string;
    createdAt: number;
  }) => {
    setEditingMemory({ id: memory.id, createdAt: memory.createdAt });
    setEditMemoryText(memory.text);
    setShowEditDialog(true);
  };

  const handleEditMemory = async () => {
    if (!editingMemory || !editMemoryText.trim()) return;

    setIsEditing(true);
    try {
      await editMemory(
        editingMemory.id,
        editMemoryText.trim(),
        editingMemory.createdAt,
      );
      toast({
        type: 'success',
        description: 'Memory updated successfully',
      });
      setEditMemoryText('');
      setEditingMemory(null);
      setShowEditDialog(false);
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to update memory',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const memoryCount = getMemoryCount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'} stored
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            disabled={isLoading}
          >
            <Plus className="size-4 mr-1" /> Add Memory
          </Button>
        </div>
      </div>

      {memories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">
              No memories stored
            </CardTitle>
            <CardDescription className="text-center">
              Memories will appear here when the AI saves information about your
              conversations
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-2">
            {memories.map((memory) => (
              <Card key={memory.id} className="relative py-2">
                <div className="px-4 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">
                      {formatRelativeTime(memory.createdAt)}
                    </p>
                    <p className="text-sm leading-relaxed break-words">
                      {memory.text}
                    </p>
                  </div>
                  <div className="flex shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-primary/10"
                      onClick={() => handleOpenEditDialog(memory)}
                      disabled={isLoading || deletingId === memory.id}
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteMemory(memory.id)}
                      disabled={isLoading || deletingId === memory.id}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="font-semibold mb-2">Clear All Memories?</div>
            <div className="mb-4 text-sm text-muted-foreground">
              This will permanently delete all stored memories. This action
              cannot be undone.
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={isLoading}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Enter memory text..."
              className="min-h-[120px]"
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMemory}
              disabled={isAdding || !newMemoryText.trim()}
            >
              Save Memory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Memory Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Edit memory text..."
              className="min-h-[120px]"
              value={editMemoryText}
              onChange={(e) => setEditMemoryText(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setEditingMemory(null);
              }}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMemory}
              disabled={isEditing || !editMemoryText.trim()}
            >
              Update Memory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

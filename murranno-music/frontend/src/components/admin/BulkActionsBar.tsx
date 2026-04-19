import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trash2, Pause, Play } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onPause: () => void;
  onActivate: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onApprove,
  onReject,
  onPause,
  onActivate,
  onDelete,
  onClearSelection
}: BulkActionsBarProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'pause' | 'activate' | 'delete' | null>(null);

  const handleAction = (actionType: typeof action) => {
    if (actionType === 'delete') {
      setDeleteDialogOpen(true);
    } else {
      setAction(actionType);
    }
  };

  const confirmAction = () => {
    switch (action) {
      case 'approve':
        onApprove();
        break;
      case 'reject':
        onReject();
        break;
      case 'pause':
        onPause();
        break;
      case 'activate':
        onActivate();
        break;
    }
    setAction(null);
    onClearSelection();
  };

  const confirmDelete = () => {
    onDelete();
    setDeleteDialogOpen(false);
    onClearSelection();
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
        <span className="text-sm font-medium">
          {selectedCount} campaign{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('approve')}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('reject')}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('pause')}
            className="gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('activate')}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Activate
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('delete')}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          Clear
        </Button>
      </div>

      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} {selectedCount} campaign{selectedCount !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaigns</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} campaign{selectedCount !== 1 ? 's' : ''}?
              This action cannot be undone and will permanently remove all campaign data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

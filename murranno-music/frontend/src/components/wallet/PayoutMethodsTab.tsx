import { useState } from 'react';
import { Plus, Settings, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddPayoutMethodSheet } from './AddPayoutMethodSheet';
import { usePayoutMethods } from '@/hooks/usePayoutMethods';
import { Loader2 } from 'lucide-react';
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

export const PayoutMethodsTab = () => {
  const { payoutMethods, loading, deleteMethod, setPrimary, refetch } = usePayoutMethods();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const methodColors = {
    bank: 'from-primary/10 to-primary/5 border-primary/20',
  };

  const iconColors = {
    bank: 'bg-primary/20 text-primary',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Payout Methods List */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-card-foreground">Your Payout Methods</CardTitle>
              <Button 
                size="sm"
                onClick={() => setShowAddSheet(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {payoutMethods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No payout methods added yet</p>
                <Button onClick={() => setShowAddSheet(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first bank account
                </Button>
              </div>
            ) : (
              payoutMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative bg-gradient-to-br ${methodColors.bank} rounded-[16px] p-4 border transition-smooth hover:shadow-soft`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${iconColors.bank} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="font-bold text-sm">{method.bank_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-card-foreground">{method.bank_name}</p>
                        {method.is_primary && (
                          <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.account_name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{method.account_number}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {method.is_verified && (
                          <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded-full">Verified</span>
                        )}
                        <span className="text-xs text-muted-foreground">{method.currency}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!method.is_primary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPrimary(method.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(method.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Manage Section */}
        <Card className="bg-card border border-border rounded-[20px] shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground mb-1">Manage your payout methods</h3>
                <p className="text-sm text-muted-foreground">Update details, verify accounts, or add new methods</p>
              </div>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => setShowAddSheet(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddPayoutMethodSheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSuccess={refetch}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payout method?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this payout method from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMethod(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FieldError } from '@/components/forms/FieldError';
import { fieldA11y, matches, password as passwordRule, required, validate } from '@/lib/validation';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const handleChangePassword = async () => {
    const found = validate({ newPassword, confirmPassword }, { newPassword: [passwordRule], confirmPassword: [required('the new password again'), matches(newPassword)] });
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      // current_password is checked by the API (not part of supabase-js' types)
      const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword } as Parameters<typeof supabase.auth.updateUser>[0]);
      
      if (error) throw error;
      
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter a new password for your account. Use at least 8 characters with letters and numbers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput
              id="current-password"
              autoComplete="current-password"
              placeholder="Leave empty if you only sign in with Google or Apple"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }}
              disabled={loading}
              autoComplete="new-password"
              {...fieldA11y('new-password', errors.newPassword)}
            />
            <FieldError id="new-password" error={errors.newPassword} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
              disabled={loading}
              autoComplete="new-password"
              {...fieldA11y('confirm-password', errors.confirmPassword)}
            />
            <FieldError id="confirm-password" error={errors.confirmPassword} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthShell } from '@/components/auth/AuthShell';
import { FieldError } from '@/components/forms/FieldError';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, SuccessState, friendlyError } from '@/components/states/StateViews';
import { fieldA11y, matches, password as passwordRule, required, validate } from '@/lib/validation';
import { cn } from '@/lib/utils';

type Stage = 'checking' | 'ready' | 'invalid' | 'done';

/** 0-3: length 8+, letters and numbers, 12+ or a symbol. */
const strength = (p: string) => (p.length >= 8 ? 1 : 0) + (/[A-Za-z]/.test(p) && /\d/.test(p) ? 1 : 0) + (p.length >= 12 || /[^A-Za-z0-9]/.test(p) ? 1 : 0);

export const ResetPassword = () => {
  const [stage, setStage] = useState<Stage>('checking');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // The email link lands here with a recovery session (or an error) in the URL; the code path arrives already signed in.
    if (/error_code=|error=/.test(window.location.hash + window.location.search)) { setStage('invalid'); return; }
    let settled = false;
    const decide = (hasSession: boolean) => { if (!settled) { settled = true; setStage(hasSession ? 'ready' : 'invalid'); } };
    const { data } = supabase.auth.onAuthStateChange((event, session) => { if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) decide(true); });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) decide(true); else setTimeout(() => decide(false), 1500); });
    return () => data.subscription.unsubscribe();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate({ password, confirm }, { password: [passwordRule], confirm: [required('your new password again'), matches(password)] });
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) { setErrors({ form: friendlyError(error).message }); return; }
    setStage('done');
  };

  if (stage === 'checking') {
    return <AuthShell back="/login" title="Choose a new password"><div className="space-y-4" aria-busy="true" aria-label="Checking your reset link"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-12 w-full" /></div></AuthShell>;
  }
  if (stage === 'invalid') {
    return <AuthShell back="/login" title="This link has expired">
      <EmptyState title="Your reset link is no longer valid" body="Reset links work once and expire after 1 hour. Request a new one and use the latest email." action={{ label: 'Send a new link', to: '/forgot-password' }} secondary={{ label: 'Back to log in', to: '/login' }} className="px-0" />
    </AuthShell>;
  }
  if (stage === 'done') {
    return <AuthShell back="/login" title="Password updated">
      <SuccessState title="Your password has been changed" body="You’re signed in on this device. Other devices have been signed out for your security." action={{ label: 'Continue to your dashboard', to: '/app' }} className="px-0" />
    </AuthShell>;
  }

  const score = strength(password);
  return (
    <AuthShell back="/login" title="Choose a new password">
      <form onSubmit={save} noValidate className="space-y-5">
        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" autoComplete="new-password" placeholder="At least 8 characters" value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors({}); }} {...fieldA11y('password', errors.password)} />
          <FieldError id="password" error={errors.password} />
          {password && !errors.password && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden>{[1, 2, 3].map((i) => <span key={i} className={cn('h-1 flex-1 rounded-full', score >= i ? (score === 3 ? 'bg-success' : score === 2 ? 'bg-warning' : 'bg-destructive') : 'bg-secondary')} />)}</div>
              <span className="text-xs text-muted-foreground">{['Too weak', 'Weak', 'Good', 'Strong'][score]}</span>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <PasswordInput id="confirm" autoComplete="new-password" placeholder="Type it again" value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors({}); }} {...fieldA11y('confirm', errors.confirm)} />
          <FieldError id="confirm" error={errors.confirm} />
        </div>
        {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}
        <Button type="submit" className="w-full min-h-[52px] rounded-[10px] text-base font-semibold" disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save new password'}
        </Button>
        <p className="text-center text-sm"><Link to="/forgot-password" className="font-semibold text-primary hover:underline">Send a new link instead</Link></p>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;

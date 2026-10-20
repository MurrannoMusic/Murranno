import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AuthShell } from '@/components/auth/AuthShell';
import { FieldError } from '@/components/forms/FieldError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { friendlyError } from '@/components/states/StateViews';
import { email as emailRule, fieldA11y, validate } from '@/lib/validation';

const RESEND_AFTER = 60; // seconds before another email can be requested

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    const found = validate({ email }, { email: [emailRule] });
    setError(found.email);
    if (found.email) return;
    setLoading(true);
    const { error: apiError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    // For privacy the API answers the same whether or not the address has an account.
    if (apiError && friendlyError(apiError).kind !== 'validation') { setError(friendlyError(apiError).message); return; }
    setSent(true);
    setCooldown(RESEND_AFTER);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setCodeError('Enter the 6-digit code from the email'); return; }
    setVerifying(true);
    const { error: apiError } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'recovery' });
    setVerifying(false);
    if (apiError) { setCodeError('That code is wrong or has expired. Check the latest email or send a new code.'); return; }
    navigate('/reset-password');
  };

  if (sent) {
    return (
      <AuthShell back="/login" title="Check your email">
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MailCheck className="h-6 w-6 shrink-0 text-success" />
            <p className="text-sm leading-relaxed">If an account exists for <strong>{email.trim()}</strong>, we’ve sent a link and a 6-digit code to reset your password. The link expires in 1 hour.</p>
          </div>

          <form onSubmit={verifyCode} noValidate className="space-y-3">
            <Label htmlFor="code">Opened the email on another device? Enter the code instead</Label>
            <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(undefined); }} {...fieldA11y('code', codeError)} className="tracking-[0.3em] text-lg" />
            <FieldError id="code" error={codeError} />
            <Button type="submit" className="w-full min-h-[52px] rounded-[10px] text-base font-semibold" disabled={verifying}>
              {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking code…</> : 'Continue'}
            </Button>
          </form>

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>Didn’t get it? Check your spam folder, or make sure the address is right.</p>
            <div className="flex justify-center gap-4">
              <button type="button" className="font-semibold text-primary disabled:text-muted-foreground disabled:cursor-not-allowed" disabled={cooldown > 0 || loading} onClick={send}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? 'Sending…' : 'Resend email'}
              </button>
              <button type="button" className="font-semibold text-primary" onClick={() => { setSent(false); setCode(''); }}>Use a different email</button>
            </div>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell back="/login" title="Reset your password">
      <form onSubmit={(e) => { e.preventDefault(); void send(); }} noValidate className="space-y-6">
        <p className="text-sm text-muted-foreground">Enter the email you signed up with and we’ll send you a link to choose a new password.</p>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="Enter your email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(undefined); }} {...fieldA11y('email', error)} />
          <FieldError id="email" error={error} />
        </div>
        <Button type="submit" className="w-full min-h-[52px] rounded-[10px] text-base font-semibold" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending reset link…</> : 'Send reset link'}
        </Button>
        <p className="text-center">Remember your password? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;

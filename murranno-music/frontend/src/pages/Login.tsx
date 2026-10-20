import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { FieldError } from '@/components/forms/FieldError';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { email as emailRule, fieldA11y, required, validate } from '@/lib/validation';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [params] = useSearchParams();
  // Where to return after an expired session; only same-site paths ("/x", never "//host").
  const next = params.get('next');
  const safeNext = next && /^\/(?!\/)/.test(next) ? next : null;
  const getPostLoginRoute = () => {
    if (safeNext) return safeNext;
    if (!userRole) return '/app/dashboard';

    switch (userRole.tier) {
      case 'admin':
        return '/admin';
      case 'artist':
        return '/app/artist-dashboard';
      case 'label':
        return '/app/label-dashboard';
      case 'agency':
        return '/app/agency-dashboard';
      default:
        return '/app/dashboard';
    }
  };

  useEffect(() => {
    if (user) {
      navigate(getPostLoginRoute());
    }
  }, [user, navigate, userRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate({ email, password }, { email: [emailRule], password: [required('your password')] });
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);

    try {
      // Stay on the form when sign-in fails (the error toast explains why); the effect above redirects on success.
      const { error } = await signIn(email.trim(), password);
      if (!error) navigate(getPostLoginRoute());
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell back="/signup" title={'Log in to your account'}>
              {params.get('reason') === 'expired' && (
                <div role="status" className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                  <strong>Your session expired.</strong> Sign in again to continue where you left off.
                </div>
              )}
              <SocialLoginButtons />

              <form onSubmit={handleLogin} noValidate className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                      placeholder="Enter your email"
                      autoComplete="email"
                      {...fieldA11y('email', errors.email)}
                    />
                    <FieldError id="email" error={errors.email} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      {...fieldA11y('password', errors.password)}
                    />
                    <FieldError id="password" error={errors.password} />
                  </div>
                </div>

                <Button type="submit" className="w-full min-h-[52px] rounded-[10px] text-base font-semibold" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-semibold hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
    </AuthShell>
  );
};
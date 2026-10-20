import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/useUserType';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { UserType } from '@/types/user';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { FieldError } from '@/components/forms/FieldError';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { email as emailRule, fieldA11y, matches, ngPhone, password as passwordRule, required, validate } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { isNativeApp } from '@/utils/platformDetection';

export const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, user, userRole } = useAuth();
  const { switchUserType } = useUserType();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const preselectedTier = (location.state?.tier || 'artist') as UserType;

  const getPostLoginRoute = () => {
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

  type Field = 'firstName' | 'lastName' | 'phone' | 'email' | 'password' | 'confirmPassword';
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const clearError = (field: Field) => setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate(
      { firstName, lastName, phone, email, password, confirmPassword },
      {
        firstName: [required('your first name')],
        lastName: [required('your last name')],
        phone: [required('your phone number'), ngPhone],
        email: [emailRule],
        password: [passwordRule],
        confirmPassword: [required('your password again'), matches(password)],
      },
    );
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, firstName, lastName, phone);

      if (error) {
        // Check for specific error message regarding existing user
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          toast({
            title: 'User already exists',
            description: 'An account with this email already exists. Please log in instead.',
            variant: 'destructive',
          });
          // Optional: navigate to login after a short delay or immediately
          // setTimeout(() => navigate('/login'), 2000);
        }
        setLoading(false);
        return;
      }

      // Show verification message instead of navigating
      setShowVerificationMessage(true);


      toast({
        title: 'Check your email',
        description: 'We sent you a verification code. Please check your email to continue.',
      });

      // Navigate to verification page with email
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell back={isNativeApp() ? '/welcome' : '/landing'} variant="signup" title={showVerificationMessage ? 'Verify your email' : 'Join Murranno Music'}>
              {showVerificationMessage ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p>
                    We've sent a verification link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check your inbox and click the link to verify your account.
                  </p>
                  <Button
                    onClick={() => navigate('/verify-email')}
                    className="w-full min-h-[52px] rounded-[10px] text-base font-semibold"
                  >
                    Go to Verification Page
                  </Button>
                  <Button
                    onClick={() => setShowVerificationMessage(false)}
                    variant="ghost"
                    className="w-full"
                  >
                    Back to Signup
                  </Button>
                </div>
              ) : (
                <>
                  <SocialLoginButtons />

                  <form onSubmit={handleSignup} noValidate className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                            placeholder="John"
                            autoComplete="given-name"
                            {...fieldA11y('firstName', errors.firstName)}
                          />
                          <FieldError id="firstName" error={errors.firstName} />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => { setLastName(e.target.value); clearError('lastName'); }}
                            placeholder="Doe"
                            autoComplete="family-name"
                            {...fieldA11y('lastName', errors.lastName)}
                          />
                          <FieldError id="lastName" error={errors.lastName} />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                          placeholder="+234..."
                          autoComplete="tel"
                          {...fieldA11y('phone', errors.phone)}
                        />
                        <FieldError id="phone" error={errors.phone} />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...fieldA11y('email', errors.email)}
                        />
                        <FieldError id="email" error={errors.email} />
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                          id="password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          {...fieldA11y('password', errors.password)}
                        />
                        <FieldError id="password" error={errors.password} />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          {...fieldA11y('confirmPassword', errors.confirmPassword)}
                        />
                        <FieldError id="confirmPassword" error={errors.confirmPassword} />
                      </div>
                    </div>

                    <Button type="submit" className="w-full min-h-[52px] rounded-[10px] text-base font-semibold" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p>
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary font-semibold hover:underline">
                        Log in
                      </Link>
                    </p>
                  </div>
                </>
              )}
    </AuthShell>
  );
};

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/hooks/useUserType';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import musicianBg from '@/assets/musician-background.jpg';
import { UserType } from '@/types/user';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useToast } from '@/hooks/use-toast';

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${musicianBg})`,
          backgroundSize: 'cover',
          backgroundPosition: '65% center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Content positioned with card at bottom */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pt-8 pb-8">
        <div className="mobile-container">
          <Link to="/welcome" className="mb-4 inline-block">
            <ArrowLeft className="h-6 w-6 text-white drop-shadow-lg" />
          </Link>
        </div>

        <div className="mobile-container">

          <Card className="backdrop-blur-xl bg-black/30 border-white/20 shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <CardTitle className="text-center text-2xl text-white drop-shadow-lg">
                {showVerificationMessage ? 'Verify Your Email' : 'Join Murranno Music'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showVerificationMessage ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-white/90 drop-shadow-md">
                    We've sent a verification link to <strong>{email}</strong>
                  </p>
                  <p className="text-white/70 text-sm drop-shadow-md">
                    Please check your inbox and click the link to verify your account.
                  </p>
                  <Button
                    onClick={() => navigate('/verify-email')}
                    className="w-full gradient-primary music-button shadow-primary"
                  >
                    Go to Verification Page
                  </Button>
                  <Button
                    onClick={() => setShowVerificationMessage(false)}
                    variant="ghost"
                    className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Back to Signup
                  </Button>
                </div>
              ) : (
                <>
                  <SocialLoginButtons />

                  <form onSubmit={handleSignup} className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-white/90 drop-shadow-md">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="John"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-white/90 drop-shadow-md">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Doe"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-white/90 drop-shadow-md">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white/90 drop-shadow-md">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-white/90 drop-shadow-md">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-white/90 drop-shadow-md">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full gradient-primary music-button shadow-primary" size="lg" disabled={loading}>
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
                    <p className="text-white/90 drop-shadow-md">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary font-medium hover:underline drop-shadow-lg">
                        Log in
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
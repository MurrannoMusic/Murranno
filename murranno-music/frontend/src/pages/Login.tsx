import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Fingerprint } from 'lucide-react';
import musicianBg from '@/assets/musician-background.jpg';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

export const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkAvailability, authenticate, getBiometryName } = useBiometricAuth();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

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

  useEffect(() => {
    const checkBiometric = async () => {
      const availability = await checkAvailability();
      setBiometricAvailable(availability.isAvailable);
      if (availability.isAvailable) {
        setBiometricType(getBiometryName(availability.biometryType));
      }
    };

    checkBiometric();
  }, []);

  const handleBiometricLogin = async () => {
    const savedEmail = localStorage.getItem('biometric_login_email');

    if (!savedEmail) {
      return;
    }

    const success = await authenticate({
      reason: 'Authenticate to log in to your account',
      androidTitle: 'Login Authentication',
      androidSubtitle: 'Verify your identity to continue',
    });

    if (success) {
      setLoading(true);
      setEmail(savedEmail);
      // In a real implementation, you'd store and retrieve an encrypted token
      // For this demo, we'll just show the biometric was successful
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      // Save email for biometric login on next time
      localStorage.setItem('biometric_login_email', email);
      navigate(getPostLoginRoute());
    } catch (error) {
      console.error('Login error:', error);
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
          <Link to="/signup" className="mb-4 inline-block">
            <ArrowLeft className="h-6 w-6 text-white drop-shadow-lg" />
          </Link>
        </div>

        <div className="mobile-container">

          <Card className="backdrop-blur-xl bg-black/30 border-white/20 shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <CardTitle className="text-center text-2xl text-white drop-shadow-lg">Log in to your account</CardTitle>
            </CardHeader>
            <CardContent>
              <SocialLoginButtons />

              {biometricAvailable && (
                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={handleBiometricLogin}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/15"
                    size="lg"
                  >
                    <Fingerprint className="w-5 h-5 mr-2" />
                    Continue with {biometricType}
                  </Button>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-transparent text-white/70">or</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className={`space-y-6 ${biometricAvailable ? '' : 'mt-6'}`}>
                <div className="space-y-4">
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
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="password" className="text-white/90 drop-shadow-md">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline drop-shadow-lg">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-primary music-button shadow-primary" size="lg" disabled={loading}>
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
                <p className="text-white/90 drop-shadow-md">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-medium hover:underline drop-shadow-lg">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
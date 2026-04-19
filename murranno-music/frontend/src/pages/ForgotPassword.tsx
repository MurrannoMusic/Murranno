import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import musicianBg from '@/assets/musician-background.jpg';

export const ForgotPassword = () => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await resetPasswordForEmail(email);
      if (!error) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
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
          <Link to="/login" className="mb-4 inline-block">
            <ArrowLeft className="h-6 w-6 text-white drop-shadow-lg" />
          </Link>
        </div>
        
        <div className="mobile-container">
          <Card className="backdrop-blur-xl bg-black/30 border-white/20 shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <CardTitle className="text-center text-2xl text-white drop-shadow-lg">
                Reset your password
              </CardTitle>
              <CardDescription className="text-center text-white/70 drop-shadow-md">
                {emailSent 
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-400 drop-shadow-lg" />
                    <p className="text-white/90 text-center drop-shadow-md">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-white/70 text-sm text-center drop-shadow-md">
                      Please check your email and click the link to reset your password.
                    </p>
                  </div>
                  <Link to="/login" className="block">
                    <Button className="w-full gradient-primary music-button shadow-primary" size="lg">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
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

                  <Button type="submit" className="w-full gradient-primary music-button shadow-primary" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-white/90 drop-shadow-md">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline drop-shadow-lg">
                    Log in
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

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import musicianBg from '@/assets/musician-background.jpg';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { verifyEmailOtp, resendEmailOtp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await resendEmailOtp(email);
      setCountdown(60); // Start 60s cooldown
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the complete 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyEmailOtp(email, otp);

      if (error) {
        setIsLoading(false);
        // Error toast handled in verifyEmailOtp
      } else {
        // Success toast handled in verifyEmailOtp, wait a bit then redirect
        setTimeout(() => navigate('/app/dashboard'), 1500);
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Verification error:', err);
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${musicianBg})`,
          backgroundSize: 'cover',
          backgroundPosition: '65% center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-black/30 border-white/20 shadow-2xl">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle className="text-center text-2xl text-white drop-shadow-lg">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center text-white/70">
              Enter the 6-digit code sent to <span className="font-semibold text-white">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center space-y-6">

            <div className="space-y-4 w-full flex flex-col items-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                </InputOTPGroup>
              </InputOTP>

              <p className="text-xs text-white/50">
                Didn't receive code? Check your spam folder or try signing up again.
              </p>
            </div>

            <div className="w-full space-y-2">
              <Button
                onClick={(e) => handleVerify(e)}
                className="w-full gradient-primary music-button shadow-primary"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-white/50 hover:text-white"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    "Resend Code"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => navigate('/signup')}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign Up
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

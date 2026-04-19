import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isNativeApp } from '@/utils/platformDetection';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [showManualRedirect, setShowManualRedirect] = useState(false);
  const [nativeRedirectUrl, setNativeRedirectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse tokens from URL hash fragment (Supabase OAuth returns tokens in hash)
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        
        // Check if this is a native platform request
        const urlParams = new URLSearchParams(window.location.search);
        const platform = urlParams.get('platform');
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('[AuthCallback] Platform:', platform);
        console.log('[AuthCallback] isNativeApp:', isNativeApp());
        console.log('[AuthCallback] Has tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
        console.log('[AuthCallback] Full URL:', window.location.href);

        if (errorParam) {
          console.error('[AuthCallback] OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          toast.error(`Authentication failed: ${errorDescription || errorParam}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (accessToken && refreshToken) {
          const isNative = isNativeApp() || platform === 'native';
          
          if (isNative) {
            // Build native callback URL
            const callbackUrl = `murranno://callback#access_token=${accessToken}&refresh_token=${refreshToken}`;
            setNativeRedirectUrl(callbackUrl);
            
            console.log('[AuthCallback] Attempting native redirect...');
            
            // Attempt 1: Immediate redirect with replace
            try {
              window.location.replace(callbackUrl);
              console.log('[AuthCallback] replace() called');
            } catch (e) {
              console.warn('[AuthCallback] replace() failed:', e);
            }
            
            // Attempt 2: Delayed href assignment
            setTimeout(() => {
              console.log('[AuthCallback] Attempting href redirect...');
              window.location.href = callbackUrl;
            }, 300);
            
            // Attempt 3: Show manual button if redirects fail
            setTimeout(() => {
              console.log('[AuthCallback] Showing manual redirect button');
              setShowManualRedirect(true);
            }, 1500);
            
            return;
          }

          // For web: Establish Supabase session directly
          console.log('[AuthCallback] Web flow - setting session...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('[AuthCallback] Failed to set session:', sessionError);
            setError('Failed to complete sign in. Please try again.');
            toast.error('Failed to complete sign in. Please try again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }

          console.log('[AuthCallback] Session established:', data.user?.email);
          toast.success('Successfully signed in!');
          navigate('/app/dashboard');
        } else {
          console.error('[AuthCallback] No tokens found in URL');
          setError('Authentication incomplete. Please try again.');
          toast.error('Authentication incomplete. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (error) {
        console.error('[AuthCallback] Unexpected error:', error);
        setError('An error occurred during sign in.');
        toast.error('An error occurred during sign in.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  const handleManualRedirect = () => {
    if (nativeRedirectUrl) {
      console.log('[AuthCallback] Manual redirect triggered');
      window.location.href = nativeRedirectUrl;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-6">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Authentication Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-6">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Completing sign in...</h2>
        <p className="text-sm text-muted-foreground">
          {showManualRedirect 
            ? 'If the app didn\'t open automatically, tap the button below'
            : 'Please wait while we authenticate your account'
          }
        </p>
        
        {showManualRedirect && nativeRedirectUrl && (
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleManualRedirect}
              className="gap-2"
              size="lg"
            >
              <ExternalLink className="h-4 w-4" />
              Open in App
            </Button>
            <p className="text-xs text-muted-foreground">
              Having trouble? Make sure the Murranno app is installed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

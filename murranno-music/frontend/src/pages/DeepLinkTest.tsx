import { useState, useEffect } from 'react';
import { isNativeApp, getPlatformInfo } from '@/utils/platformDetection';
import { getDeepLinkLog } from '@/hooks/useDeepLink';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, RefreshCw, ExternalLink, CheckCircle2, XCircle, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

export default function DeepLinkTest() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [logs, setLogs] = useState<Array<{ timestamp: string; event: string; data?: any }>>([]);
  const [platformInfo, setPlatformInfo] = useState<any>(null);

  useEffect(() => {
    // Get current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Get platform info
    const info = getPlatformInfo();
    setPlatformInfo(info);

    // Get deep link logs
    setLogs(getDeepLinkLog());
  }, []);

  const refreshLogs = () => {
    setLogs(getDeepLinkLog());
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  };

  const testCustomScheme = () => {
    const testUrl = 'murranno://callback#access_token=test&refresh_token=test';
    window.location.href = testUrl;
  };

  const openTestOAuth = async () => {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({
        url: `${window.location.origin}/auth/callback?platform=native#access_token=test&refresh_token=test`,
        toolbarColor: '#1DB954',
      });
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Deep Link Debugger</h1>
        </div>

        {/* Platform Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Platform Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Is Native App</span>
              <Badge variant={isNativeApp() ? 'default' : 'secondary'}>
                {isNativeApp() ? 'Yes' : 'No'}
              </Badge>
            </div>
            {platformInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <Badge variant="outline">{platformInfo.platform || 'web'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Is iOS</span>
                  <Badge variant="outline">{platformInfo.isIOS ? 'Yes' : 'No'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Is Android</span>
                  <Badge variant="outline">{platformInfo.isAndroid ? 'Yes' : 'No'}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Auth Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {user ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Authenticated</span>
              <Badge variant={user ? 'default' : 'destructive'}>
                {user ? 'Yes' : 'No'}
              </Badge>
            </div>
            {user && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-mono">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <Badge variant="outline">{user.app_metadata?.provider || 'email'}</Badge>
                </div>
              </>
            )}
            {session && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Session Expires</span>
                <span className="text-xs font-mono">
                  {new Date(session.expires_at! * 1000).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Test Actions</CardTitle>
            <CardDescription>Test deep link functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={testCustomScheme}
            >
              <ExternalLink className="h-4 w-4" />
              Test Custom URL Scheme
            </Button>
            {isNativeApp() && (
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={openTestOAuth}
              >
                <ExternalLink className="h-4 w-4" />
                Test OAuth Browser Flow
              </Button>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={refreshLogs}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Logs
            </Button>
          </CardContent>
        </Card>

        {/* Deep Link Logs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Deep Link Event Log</CardTitle>
            <CardDescription>Recent deep link events ({logs.length} entries)</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No deep link events recorded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.slice().reverse().map((log, index) => (
                    <div key={index} className="border rounded-lg p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.event}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.data && (
                        <pre className="bg-muted p-1 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* URL Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current URL Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Origin: </span>
                {window.location.origin}
              </div>
              <div>
                <span className="text-muted-foreground">Pathname: </span>
                {window.location.pathname}
              </div>
              <div>
                <span className="text-muted-foreground">Search: </span>
                {window.location.search || '(none)'}
              </div>
              <div>
                <span className="text-muted-foreground">Hash: </span>
                {window.location.hash || '(none)'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

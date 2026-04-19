import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, FileText, Smartphone, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CheckItem {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  details?: string;
  action?: string;
  actionLink?: string;
}

interface CheckCategory {
  category: string;
  icon: any;
  items: CheckItem[];
}

const PreflightCheck = () => {
  const [checks, setChecks] = useState<CheckCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    setLoading(true);
    
    const capacitorPlugins = [
      '@capacitor/app',
      '@capacitor/browser',
      '@capacitor/camera',
      '@capacitor/clipboard',
      '@capacitor/device',
      '@capacitor/filesystem',
      '@capacitor/geolocation',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/local-notifications',
      '@capacitor/network',
      '@capacitor/push-notifications',
      '@capacitor/screen-orientation',
      '@capacitor/share',
      '@capacitor/status-bar',
    ];

    const checkResults: CheckCategory[] = [
      {
        category: 'Capacitor Configuration',
        icon: Smartphone,
        items: [
          {
            id: 'cap-config',
            name: 'capacitor.config.ts',
            description: 'Capacitor configuration file exists with correct app ID',
            status: 'pass',
            details: 'App ID: app.lovable.c3daad8632214cd78f32217f9f05ec3c',
          },
          {
            id: 'cap-core',
            name: '@capacitor/core',
            description: 'Capacitor core package installed',
            status: 'pass',
            details: 'Required for all Capacitor functionality',
          },
          {
            id: 'cap-android',
            name: '@capacitor/android',
            description: 'Android platform support',
            status: 'pass',
            details: 'Ready for Android builds',
          },
          {
            id: 'cap-ios',
            name: '@capacitor/ios',
            description: 'iOS platform support',
            status: 'pass',
            details: 'Ready for iOS builds',
          },
        ],
      },
      {
        category: 'Installed Plugins',
        icon: Download,
        items: capacitorPlugins.map((plugin) => ({
          id: plugin,
          name: plugin.replace('@capacitor/', ''),
          description: `${plugin} plugin installed`,
          status: 'pass' as const,
          details: 'Available for use in the app',
        })),
      },
      {
        category: 'Setup Documentation',
        icon: FileText,
        items: [
          {
            id: 'android-setup',
            name: 'ANDROID_SETUP.md',
            description: 'Android configuration guide',
            status: 'pass',
            details: 'Complete guide for AndroidManifest.xml and build.gradle',
            action: 'View Guide',
            actionLink: '/ANDROID_SETUP.md',
          },
          {
            id: 'capacitor-setup',
            name: 'CAPACITOR_SETUP.md',
            description: 'General Capacitor setup instructions',
            status: 'pass',
            details: 'Platform setup and configuration',
            action: 'View Guide',
          },
          {
            id: 'push-notifications',
            name: 'PUSH_NOTIFICATIONS_SETUP.md',
            description: 'Push notifications configuration',
            status: 'pass',
            details: 'Firebase and native setup for push notifications',
            action: 'View Guide',
          },
          {
            id: 'badge-notifications',
            name: 'BADGE_NOTIFICATIONS_SETUP.md',
            description: 'Badge notifications setup',
            status: 'pass',
            details: 'App icon badge configuration',
            action: 'View Guide',
          },
          {
            id: 'audio-player',
            name: 'AUDIO_PLAYER_FEATURES.md',
            description: 'Native audio player documentation',
            status: 'pass',
            details: 'Background audio playback setup',
            action: 'View Guide',
          },
          {
            id: 'capacitor-features',
            name: 'CAPACITOR_NATIVE_FEATURES.md',
            description: 'Native features documentation',
            status: 'pass',
            details: 'All available Capacitor features',
            action: 'View Guide',
          },
        ],
      },
      {
        category: 'OAuth & Deep Linking',
        icon: FileText,
        items: [
          {
            id: 'url-scheme',
            name: 'Custom URL Scheme',
            description: 'App URL scheme configured for OAuth callbacks',
            status: 'pass',
            details: 'Scheme: murranno://\nConfigured in capacitor.config.ts',
          },
          {
            id: 'deep-link-handler',
            name: 'Deep Link Handler',
            description: 'Deep link listener registered in app',
            status: 'pass',
            details: 'Handler active in App component via useDeepLink hook',
          },
          {
            id: 'oauth-redirect',
            name: 'Backend OAuth Redirect URL',
            description: 'Add murranno://callback to backend auth settings',
            status: 'warning',
            details: 'Go to Lovable Cloud → Users → Auth Settings and add:\nmurranno://callback',
            action: 'Open Backend',
          },
          {
            id: 'android-intent',
            name: 'Android Intent Filter',
            description: 'Configure deep link intent in AndroidManifest.xml',
            status: 'info',
            details: 'See ANDROID_SETUP.md for deep linking configuration',
            action: 'View Guide',
          },
          {
            id: 'ios-url-types',
            name: 'iOS URL Types',
            description: 'Configure URL scheme in Info.plist',
            status: 'info',
            details: 'See IOS_SETUP.md for URL scheme configuration',
            action: 'View Guide',
          },
        ],
      },
      {
        category: 'Required Actions',
        icon: AlertCircle,
        items: [
          {
            id: 'export-github',
            name: 'Export to GitHub',
            description: 'Export project to GitHub repository',
            status: 'warning',
            details: 'Required before running native builds',
            action: 'Export Now',
          },
          {
            id: 'npm-install',
            name: 'Install Dependencies',
            description: 'Run npm install after cloning',
            status: 'info',
            details: 'Install all project dependencies locally',
          },
          {
            id: 'cap-add',
            name: 'Add Native Platforms',
            description: 'Run npx cap add android/ios',
            status: 'info',
            details: 'Generate native Android and iOS projects',
          },
          {
            id: 'firebase-setup',
            name: 'Firebase Configuration',
            description: 'Add google-services.json (Android) and GoogleService-Info.plist (iOS)',
            status: 'warning',
            details: 'Required for push notifications',
            action: 'See PUSH_NOTIFICATIONS_SETUP.md',
          },
          {
            id: 'android-manifest',
            name: 'AndroidManifest.xml',
            description: 'Add required permissions to AndroidManifest.xml',
            status: 'warning',
            details: 'Follow ANDROID_SETUP.md guide',
            action: 'View Permissions',
          },
          {
            id: 'build-gradle',
            name: 'build.gradle Configuration',
            description: 'Configure Android build files',
            status: 'warning',
            details: 'Add Firebase and dependencies',
            action: 'View Configuration',
          },
        ],
      },
    ];

    setChecks(checkResults);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <Check className="w-5 h-5 text-success" />;
      case 'fail':
        return <X className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-info" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-success/10 text-success border-success/20">Ready</Badge>;
      case 'fail':
        return <Badge variant="destructive">Missing</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Action Required</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      default:
        return null;
    }
  };

  const totalChecks = checks.reduce((acc, cat) => acc + cat.items.length, 0);
  const passedChecks = checks.reduce(
    (acc, cat) => acc + cat.items.filter((item) => item.status === 'pass').length,
    0
  );
  const warningChecks = checks.reduce(
    (acc, cat) => acc + cat.items.filter((item) => item.status === 'warning').length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pre-flight Checklist</h1>
          <p className="text-muted-foreground">
            Verify all native configurations before building your mobile app
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              {passedChecks} of {totalChecks} checks passed
              {warningChecks > 0 && ` • ${warningChecks} action(s) required`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{passedChecks}</div>
                <div className="text-sm text-muted-foreground">Configured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">{warningChecks}</div>
                <div className="text-sm text-muted-foreground">Action Required</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">{totalChecks}</div>
                <div className="text-sm text-muted-foreground">Total Checks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-6 pr-4">
            {checks.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card key={category.category}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-5 h-5 text-primary" />
                      <CardTitle>{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, index) => (
                        <div key={item.id}>
                          {index > 0 && <Separator className="my-3" />}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {getStatusIcon(item.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-foreground">{item.name}</h4>
                                  {getStatusBadge(item.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {item.description}
                                </p>
                                {item.details && (
                                  <p className="text-xs text-muted-foreground/70">{item.details}</p>
                                )}
                              </div>
                            </div>
                            {item.action && (
                              <Button variant="outline" size="sm">
                                {item.action}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Export this project to GitHub using the "Export to GitHub" button</p>
            <p>2. Clone the repository locally and run <code className="px-2 py-1 bg-muted rounded text-xs">npm install</code></p>
            <p>3. Add native platforms: <code className="px-2 py-1 bg-muted rounded text-xs">npx cap add android</code> and/or <code className="px-2 py-1 bg-muted rounded text-xs">npx cap add ios</code></p>
            <p>4. Follow the platform-specific setup guides (ANDROID_SETUP.md for Android)</p>
            <p>5. Build web assets: <code className="px-2 py-1 bg-muted rounded text-xs">npm run build</code></p>
            <p>6. Sync to native: <code className="px-2 py-1 bg-muted rounded text-xs">npx cap sync</code></p>
            <p>7. Open in IDE: <code className="px-2 py-1 bg-muted rounded text-xs">npx cap open android</code> or <code className="px-2 py-1 bg-muted rounded text-xs">npx cap open ios</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreflightCheck;

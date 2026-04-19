import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Smartphone,
  Database,
  Wifi,
  Trash2,
  FileText,
  Terminal,
  Settings,
  CheckCircle,
  Info,
  Zap,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useDevice } from '@/hooks/useDevice';
import { useNetwork } from '@/hooks/useNetwork';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

const DeveloperSettings = () => {
  const navigate = useNavigate();
  const { deviceInfo } = useDevice();
  const { status: networkStatus } = useNetwork();
  const [clearing, setClearing] = useState(false);

  const handleClearLocalStorage = () => {
    setClearing(true);
    try {
      localStorage.clear();
      toast.success('Local storage cleared');
    } catch (error) {
      toast.error('Failed to clear local storage');
    } finally {
      setClearing(false);
    }
  };

  const handleClearSessionStorage = () => {
    setClearing(true);
    try {
      sessionStorage.clear();
      toast.success('Session storage cleared');
    } catch (error) {
      toast.error('Failed to clear session storage');
    } finally {
      setClearing(false);
    }
  };

  const handleViewConsole = () => {
    toast.info('Opening browser console...', {
      description: 'Press F12 or Cmd+Option+I to view console',
    });
  };

  const devTools = [
    {
      title: 'Pre-flight Checklist',
      description: 'Verify native configurations before building',
      icon: CheckCircle,
      action: () => navigate('/preflight-check'),
      badge: 'Essential',
      badgeVariant: 'default' as const,
    },
    {
      title: 'Console Logs',
      description: 'View application console output',
      icon: Terminal,
      action: handleViewConsole,
      badge: 'Debug',
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Network Monitor',
      description: 'Monitor API requests and responses',
      icon: Wifi,
      action: () => toast.info('Open browser DevTools Network tab'),
      badge: 'Debug',
      badgeVariant: 'secondary' as const,
    },
    {
      title: 'Device Information',
      description: 'View current device details',
      icon: Smartphone,
      action: () => {
        const info = JSON.stringify(deviceInfo, null, 2);
        console.log('Device Info:', info);
        toast.success('Device info logged to console');
      },
      badge: 'Info',
      badgeVariant: 'outline' as const,
    },
  ];

  const storageTools = [
    {
      title: 'Clear Local Storage',
      description: 'Remove all locally stored data',
      icon: Database,
      action: handleClearLocalStorage,
      variant: 'destructive' as const,
    },
    {
      title: 'Clear Session Storage',
      description: 'Clear temporary session data',
      icon: Trash2,
      action: handleClearSessionStorage,
      variant: 'destructive' as const,
    },
  ];

  const documentation = [
    {
      title: 'Android Setup Guide',
      description: 'AndroidManifest.xml and build.gradle configuration',
      file: 'ANDROID_SETUP.md',
      icon: FileText,
    },
    {
      title: 'Capacitor Setup',
      description: 'General Capacitor configuration and setup',
      file: 'CAPACITOR_SETUP.md',
      icon: Settings,
    },
    {
      title: 'Push Notifications',
      description: 'Firebase and native push notification setup',
      file: 'PUSH_NOTIFICATIONS_SETUP.md',
      icon: Zap,
    },
    {
      title: 'Native Features',
      description: 'All available Capacitor native features',
      file: 'CAPACITOR_NATIVE_FEATURES.md',
      icon: Code,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Developer Settings</h1>
            <p className="text-muted-foreground">
              Debug tools, configuration utilities, and documentation
            </p>
          </div>
          <Badge variant={isNativeApp() ? 'default' : 'secondary'} className="text-sm">
            {isNativeApp() ? 'Native App' : 'Web Browser'}
          </Badge>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Platform</p>
                <p className="font-medium">{deviceInfo?.platform || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Model</p>
                <p className="font-medium">{deviceInfo?.model || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Operating System</p>
                <p className="font-medium">
                  {deviceInfo?.operatingSystem || 'Unknown'} {deviceInfo?.osVersion || ''}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Network</p>
                <p className="font-medium capitalize">
                  {networkStatus?.connected ? networkStatus.connectionType : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Debug & Monitoring Tools
            </CardTitle>
            <CardDescription>Tools for debugging and monitoring your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.title}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{tool.title}</h4>
                            <Badge variant={tool.badgeVariant}>{tool.badge}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Button onClick={tool.action} size="sm">
                        Open
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Storage Management
            </CardTitle>
            <CardDescription>Clear cached data and reset storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {storageTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.title}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <Icon className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{tool.title}</h4>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Button
                        onClick={tool.action}
                        variant={tool.variant}
                        size="sm"
                        disabled={clearing}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Setup Documentation
            </CardTitle>
            <CardDescription>Native configuration guides and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {documentation.map((doc) => {
                const Icon = doc.icon;
                return (
                  <Card key={doc.file} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground mb-1 truncate">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{doc.file}</code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-info/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-medium text-foreground">Developer Mode Active</p>
                <p className="text-muted-foreground">
                  These tools are intended for development and debugging. Some operations may clear
                  user data or affect app behavior.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperSettings;

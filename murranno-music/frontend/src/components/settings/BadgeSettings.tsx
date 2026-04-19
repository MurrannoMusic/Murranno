import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeIcon, Bell, BellOff } from "lucide-react";
import { Badge } from '@capawesome/capacitor-badge';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const BadgeSettings = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    checkBadgeSupport();
  }, []);

  const checkBadgeSupport = async () => {
    if (!isNativeApp()) {
      return;
    }

    try {
      const { isSupported: supported } = await Badge.isSupported();
      setIsSupported(supported);

      if (supported) {
        const { display } = await Badge.checkPermissions();
        setHasPermission(display === 'granted');

        const { count } = await Badge.get();
        setCurrentCount(count);
      }
    } catch (error) {
      console.error('Error checking badge support:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      const result = await Badge.requestPermissions();
      setHasPermission(result.display === 'granted');
      
      if (result.display === 'granted') {
        toast.success('Badge permission granted');
      } else {
        toast.error('Badge permission denied');
      }
    } catch (error) {
      console.error('Error requesting badge permission:', error);
      toast.error('Failed to request permission');
    }
  };

  const handleClearBadge = async () => {
    try {
      await Badge.clear();
      setCurrentCount(0);
      toast.success('Badge cleared');
    } catch (error) {
      console.error('Error clearing badge:', error);
      toast.error('Failed to clear badge');
    }
  };

  if (!isNativeApp()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeIcon className="h-5 w-5" />
            App Icon Badges
          </CardTitle>
          <CardDescription>
            Badge notifications are only available in the native mobile app
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeIcon className="h-5 w-5" />
            App Icon Badges
          </CardTitle>
          <CardDescription>
            Badges are not supported on this device
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeIcon className="h-5 w-5" />
          App Icon Badges
        </CardTitle>
        <CardDescription>
          Control how unread notifications appear on your app icon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Badge Permission</p>
            <p className="text-xs text-muted-foreground">
              {hasPermission 
                ? 'Badge notifications are enabled' 
                : 'Grant permission to show unread count on app icon'}
            </p>
          </div>
          {hasPermission ? (
            <div className="flex items-center gap-2 text-green-500">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Enabled</span>
            </div>
          ) : (
            <Button onClick={handleRequestPermission} size="sm">
              Enable Badges
            </Button>
          )}
        </div>

        {hasPermission && (
          <>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Badge Count</p>
                <p className="text-xs text-muted-foreground">
                  {currentCount > 0 
                    ? `${currentCount} unread notification${currentCount === 1 ? '' : 's'}` 
                    : 'No unread notifications'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentCount > 0 && (
                  <Button 
                    onClick={handleClearBadge} 
                    size="sm"
                    variant="outline"
                  >
                    <BellOff className="h-4 w-4 mr-2" />
                    Clear Badge
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">How it works</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Badge automatically shows your unread notification count</li>
                <li>Updates in real-time as you receive or read notifications</li>
                <li>Clears automatically when all notifications are read</li>
                <li>Works even when the app is closed</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';

export const AppUpdateBanner = () => {
  const { updateAvailable, availableVersion, performImmediateUpdate, openAppStore } = useAppUpdate();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Reset dismissed state when new update is available
    if (updateAvailable) {
      setIsDismissed(false);
    }
  }, [updateAvailable]);

  if (!updateAvailable || isDismissed) {
    return null;
  }

  const handleUpdate = async () => {
    const success = await performImmediateUpdate();
    if (!success) {
      // If immediate update fails, try opening app store
      await openAppStore();
    }
  };

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 bg-primary/10 border-primary animate-in slide-in-from-top">
      <Download className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <AlertTitle className="text-primary">Update Available</AlertTitle>
        <AlertDescription>
          Version {availableVersion} is ready to download. Update now for the latest features and improvements.
        </AlertDescription>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Button
          size="sm"
          onClick={handleUpdate}
          className="bg-primary hover:bg-primary/90"
        >
          Update Now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsDismissed(true)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};

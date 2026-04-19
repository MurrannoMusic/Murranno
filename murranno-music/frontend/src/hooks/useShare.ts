import { Share } from '@capacitor/share';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useShare = () => {
  const canShare = async (): Promise<boolean> => {
    if (!isNativeApp()) {
      return false;
    }

    try {
      const result = await Share.canShare();
      return result.value;
    } catch (error) {
      return false;
    }
  };

  const shareText = async (text: string, title?: string): Promise<void> => {
    if (!isNativeApp()) {
      // Fallback to Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({ text, title });
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            toast.error('Failed to share');
          }
        }
      } else {
        toast.error('Sharing is not supported');
      }
      return;
    }

    try {
      await Share.share({
        text,
        title,
        dialogTitle: 'Share',
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  const shareUrl = async (url: string, title?: string, text?: string): Promise<void> => {
    if (!isNativeApp()) {
      // Fallback to Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({ url, title, text });
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            toast.error('Failed to share');
          }
        }
      } else {
        // Fallback to copying to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard');
        } catch {
          toast.error('Sharing is not supported');
        }
      }
      return;
    }

    try {
      await Share.share({
        url,
        title,
        text,
        dialogTitle: 'Share',
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  };

  const shareTrack = async (trackTitle: string, artistName: string, trackUrl?: string): Promise<void> => {
    const text = `Check out "${trackTitle}" by ${artistName}!`;
    if (trackUrl) {
      await shareUrl(trackUrl, trackTitle, text);
    } else {
      await shareText(text, trackTitle);
    }
  };

  const shareArtist = async (artistName: string, profileUrl?: string): Promise<void> => {
    const text = `Check out ${artistName} on Murranno Music!`;
    if (profileUrl) {
      await shareUrl(profileUrl, artistName, text);
    } else {
      await shareText(text, artistName);
    }
  };

  return {
    canShare,
    shareText,
    shareUrl,
    shareTrack,
    shareArtist,
  };
};

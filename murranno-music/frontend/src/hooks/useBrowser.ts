import { Browser } from '@capacitor/browser';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useBrowser = () => {
  const openUrl = async (url: string, toolbarColor?: string) => {
    if (!isNativeApp()) {
      // Fallback to window.open for web
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      await Browser.open({ 
        url,
        toolbarColor: toolbarColor || '#000000',
      });
    } catch (error) {
      console.error('Failed to open browser:', error);
      toast.error('Failed to open link');
    }
  };

  const openStreamingPlatform = async (platform: string, url: string) => {
    const platformColors: Record<string, string> = {
      spotify: '#1DB954',
      apple: '#FC3C44',
      youtube: '#FF0000',
      soundcloud: '#FF5500',
      tidal: '#000000',
      deezer: '#FF0092',
      amazon: '#232F3E',
    };

    await openUrl(url, platformColors[platform.toLowerCase()]);
  };

  const openSocialMedia = async (platform: string, url: string) => {
    const platformColors: Record<string, string> = {
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      tiktok: '#000000',
      youtube: '#FF0000',
    };

    await openUrl(url, platformColors[platform.toLowerCase()]);
  };

  const close = async () => {
    if (!isNativeApp()) return;

    try {
      await Browser.close();
    } catch (error) {
      console.error('Failed to close browser:', error);
    }
  };

  return {
    openUrl,
    openStreamingPlatform,
    openSocialMedia,
    close,
  };
};

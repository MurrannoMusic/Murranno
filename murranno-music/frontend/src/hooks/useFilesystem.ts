import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useFilesystem = () => {
  const cacheAudioFile = async (url: string, filename: string): Promise<string | null> => {
    if (!isNativeApp()) {
      return url; // Return original URL in web
    }

    try {
      // Download the file
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/mpeg;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Save to filesystem
      const result = await Filesystem.writeFile({
        path: `audio/${filename}`,
        data: base64Data,
        directory: Directory.Cache,
      });

      return result.uri;
    } catch (error) {
      console.error('Failed to cache audio file:', error);
      return url; // Fallback to original URL
    }
  };

  const getCachedAudioPath = async (filename: string): Promise<string | null> => {
    if (!isNativeApp()) {
      return null;
    }

    try {
      const result = await Filesystem.stat({
        path: `audio/${filename}`,
        directory: Directory.Cache,
      });

      return result.uri;
    } catch (error) {
      return null; // File not cached
    }
  };

  const clearAudioCache = async (): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await Filesystem.rmdir({
        path: 'audio',
        directory: Directory.Cache,
        recursive: true,
      });
      toast.success('Audio cache cleared');
    } catch (error) {
      console.error('Failed to clear audio cache:', error);
    }
  };

  const saveFile = async (data: string, filename: string, directory: Directory = Directory.Documents): Promise<string | null> => {
    if (!isNativeApp()) {
      toast.error('File save is only available in the native app');
      return null;
    }

    try {
      const result = await Filesystem.writeFile({
        path: filename,
        data,
        directory,
        encoding: Encoding.UTF8,
      });

      toast.success('File saved successfully');
      return result.uri;
    } catch (error) {
      toast.error('Failed to save file');
      console.error('File save error:', error);
      return null;
    }
  };

  return {
    cacheAudioFile,
    getCachedAudioPath,
    clearAudioCache,
    saveFile,
  };
};

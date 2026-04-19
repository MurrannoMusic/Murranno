import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNativeApp } from '@/utils/platformDetection';
import { useState } from 'react';
import { toast } from 'sonner';

export const useCamera = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const takePhoto = async (): Promise<File | null> => {
    if (!isNativeApp()) {
      toast.error('Camera is only available in the native app');
      return null;
    }

    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (!image.webPath) {
        toast.error('Failed to capture image');
        return null;
      }

      // Convert to File object
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      
      return file;
    } catch (error) {
      if (error instanceof Error && error.message !== 'User cancelled photos app') {
        toast.error('Failed to capture photo');
        console.error('Camera error:', error);
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async (): Promise<File | null> => {
    if (!isNativeApp()) {
      toast.error('Gallery is only available in the native app');
      return null;
    }

    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (!image.webPath) {
        toast.error('Failed to select image');
        return null;
      }

      // Convert to File object
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      
      return file;
    } catch (error) {
      if (error instanceof Error && error.message !== 'User cancelled photos app') {
        toast.error('Failed to select photo');
        console.error('Gallery error:', error);
      }
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    takePhoto,
    pickFromGallery,
    isCapturing,
  };
};

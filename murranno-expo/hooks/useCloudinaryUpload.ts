import { useState } from 'react';
import { Platform } from 'react-native';
import { API_URL, supabase } from '@/integrations/supabase/client';

export interface RNFile {
  uri: string;
  type: string;
  name: string;
}

/**
 * Uploads media to the Murranno API (stored in Cloudflare R2). The name is kept from the
 * Cloudinary era so existing callers don't change; files already on Cloudinary keep working.
 */
export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: RNFile, folder: string) => {
    setUploading(true);
    setProgress(0);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // React Native sends local files as multipart parts ({ uri, name, type }).
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        if (!response.ok) throw new Error('The selected file could not be read. Please select it again.');
        const blob = await response.blob();
        formData.append('file', new File([blob], file.name, { type: file.type || blob.type }));
      } else { formData.append('file', file as any); }
      formData.append('folder', folder);

      return await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/functions/v1/upload-media`);
        xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token ?? ''}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          let response: any = null;
          try {
            response = JSON.parse(xhr.responseText);
          } catch {
            /* handled below */
          }
          if (xhr.status >= 200 && xhr.status < 300 && response?.url) {
            setProgress(100);
            resolve({ url: response.url, publicId: response.publicId });
          } else {
            reject(new Error(response?.error || `Upload failed (${xhr.status})`));
          }
        };
        xhr.timeout = 180000;
        xhr.ontimeout = () => reject(new Error('Upload timed out. Check your connection and try again.'));
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = (file: RNFile, folder: string = 'uploads') => upload(file, folder);
  const uploadAudio = (file: RNFile, folder: string = 'audio') => upload(file, folder);

  return {
    uploadImage,
    uploadAudio,
    uploading,
    progress,
  };
};

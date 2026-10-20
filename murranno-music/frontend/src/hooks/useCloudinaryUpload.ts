import { useState } from 'react';
import { API_URL, supabase } from '@/integrations/supabase/client';

/**
 * Uploads media to the Murranno API (stored in Cloudflare R2). The name is kept from the
 * Cloudinary era so existing callers don't change; files already on Cloudinary keep working.
 */
export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder: string) => {
    setUploading(true);
    setProgress(0);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = new URL(`${API_URL}/functions/v1/upload-media`);
      url.searchParams.set('folder', folder);
      url.searchParams.set('name', file.name);

      return await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url.toString());
        xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token ?? ''}`);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
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
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(file);
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = (file: File, folder: string = 'uploads') => upload(file, folder);
  const uploadAudio = (file: File, folder: string = 'audio') => upload(file, folder);

  return {
    uploadImage,
    uploadAudio,
    uploading,
    progress,
  };
};

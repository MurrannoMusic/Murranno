import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadToCloudinary = async (file: File, folder: string, resourceType: 'image' | 'video') => {
    setUploading(true);
    setProgress(0);

    try {
      // 1. Get Signature from Backend
      const { data: signatureData, error: signatureError } = await supabase.functions.invoke('generate-cloudinary-signature', {
        body: { folder },
      });

      if (signatureError) throw new Error(`Signature generation failed: ${signatureError.message}`);
      if (!signatureData?.signature) throw new Error('No signature returned from backend');

      const { signature, timestamp, cloudName, apiKey } = signatureData;

      // 2. Direct Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      return await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              setProgress(100);
              resolve({ url: response.secure_url, publicId: response.public_id });
            } catch (e) {
              reject(new Error('Invalid JSON response from Cloudinary'));
            }
          } else {
            reject(new Error(`Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error(`Error uploading ${resourceType}:`, error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = (file: File, folder: string = 'uploads') => uploadToCloudinary(file, folder, 'image');
  const uploadAudio = (file: File, folder: string = 'audio') => uploadToCloudinary(file, folder, 'video');

  return {
    uploadImage,
    uploadAudio,
    uploading,
    progress,
  };
};

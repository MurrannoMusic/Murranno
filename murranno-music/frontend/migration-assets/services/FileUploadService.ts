/**
 * React Native File Upload Service
 * Handles audio and image uploads to Supabase storage
 */

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../config/supabase';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

type ProgressCallback = (progress: UploadProgress) => void;

// Pick audio file
export const pickAudioFile = async (): Promise<DocumentPicker.DocumentPickerResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'],
      copyToCacheDirectory: true,
    });

    return result;
  } catch (error) {
    console.error('Error picking audio file:', error);
    throw error;
  }
};

// Pick image for cover art
export const pickImage = async (
  source: 'library' | 'camera' = 'library'
): Promise<ImagePicker.ImagePickerResult> => {
  try {
    // Request permissions
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission denied');
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square for cover art
      quality: 0.8,
    };

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    return result;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
};

// Upload file to Supabase Storage
export const uploadToStorage = async (
  bucket: string,
  path: string,
  fileUri: string,
  contentType: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  try {
    // Read file as base64
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const fileSize = fileInfo.size || 0;
    
    // Report initial progress
    onProgress?.({ loaded: 0, total: fileSize, percentage: 0 });

    // Read file content
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Report mid progress (upload starting)
    onProgress?.({ loaded: fileSize * 0.3, total: fileSize, percentage: 30 });

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, bytes.buffer, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Report complete
    onProgress?.({ loaded: fileSize, total: fileSize, percentage: 100 });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Upload audio track
export const uploadAudioTrack = async (
  userId: string,
  releaseId: string,
  fileUri: string,
  fileName: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const extension = fileName.split('.').pop() || 'mp3';
  const path = `${userId}/${releaseId}/${Date.now()}.${extension}`;
  
  const contentType = getAudioMimeType(extension);
  
  return uploadToStorage('track-uploads', path, fileUri, contentType, onProgress);
};

// Upload cover art
export const uploadCoverArt = async (
  userId: string,
  releaseId: string,
  fileUri: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = `${userId}/${releaseId}/cover.jpg`;
  
  return uploadToStorage('cover-art', path, fileUri, 'image/jpeg', onProgress);
};

// Upload profile image
export const uploadProfileImage = async (
  userId: string,
  fileUri: string,
  onProgress?: ProgressCallback
): Promise<UploadResult> => {
  const path = `${userId}/avatar.jpg`;
  
  return uploadToStorage('profile-images', path, fileUri, 'image/jpeg', onProgress);
};

// Delete file from storage
export const deleteFromStorage = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get signed URL for private files
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

// Helper to get MIME type for audio files
const getAudioMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/m4a',
    ogg: 'audio/ogg',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'audio/mpeg';
};

// Validate audio file
export const validateAudioFile = (
  fileName: string,
  fileSize: number
): { valid: boolean; error?: string } => {
  const allowedExtensions = ['mp3', 'wav', 'flac', 'aac', 'm4a'];
  const maxSize = 100 * 1024 * 1024; // 100MB

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  if (fileSize > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 100MB',
    };
  }

  return { valid: true };
};

// Validate image file
export const validateImageFile = (
  uri: string,
  width: number,
  height: number
): { valid: boolean; error?: string } => {
  const minDimension = 1400;
  const maxDimension = 6000;

  if (width !== height) {
    return {
      valid: false,
      error: 'Cover art must be square (1:1 aspect ratio)',
    };
  }

  if (width < minDimension) {
    return {
      valid: false,
      error: `Cover art must be at least ${minDimension}x${minDimension} pixels`,
    };
  }

  if (width > maxDimension) {
    return {
      valid: false,
      error: `Cover art must be less than ${maxDimension}x${maxDimension} pixels`,
    };
  }

  return { valid: true };
};

export default {
  pickAudioFile,
  pickImage,
  uploadAudioTrack,
  uploadCoverArt,
  uploadProfileImage,
  deleteFromStorage,
  getSignedUrl,
  validateAudioFile,
  validateImageFile,
};

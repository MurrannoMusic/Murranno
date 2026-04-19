const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const AUDIO_FORMATS = ['audio/wav', 'audio/flac', 'audio/x-wav', 'audio/x-flac'];
const IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  if (!AUDIO_FORMATS.includes(file.type)) {
    return { valid: false, error: 'Please upload an MP3, WAV, or FLAC file' };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: 'Audio file must be less than 100MB' };
  }

  return { valid: true };
};

export const validateImageDimensions = (file: File): Promise<{ valid: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 3000 || img.height < 3000) {
        resolve({ valid: false, error: 'Cover art must be at least 3000x3000px' });
      } else if (img.width !== img.height) {
        resolve({ valid: false, error: 'Cover art must be a perfect square (1:1 ratio)' });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Failed to load image for validation' });
    };
    img.src = url;
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!IMAGE_FORMATS.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPG, PNG, or WEBP image' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image must be less than 10MB' };
  }

  return { valid: true };
};

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    const url = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio file'));
    });

    audio.src = url;
  });
};

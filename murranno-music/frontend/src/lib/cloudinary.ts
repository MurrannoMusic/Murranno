import { Cloudinary } from '@cloudinary/url-gen';

// Get cloud name from environment variable
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

export const cld = new Cloudinary({
  cloud: {
    cloudName,
  },
});

import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { cld } from '@/lib/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit';
  gravity?: 'auto' | 'face' | 'center';
  className?: string;
}

export const CloudinaryImage = ({
  publicId,
  alt,
  width = 800,
  height = 800,
  crop = 'fill',
  gravity = 'auto',
  className,
}: CloudinaryImageProps) => {
  const img = cld.image(publicId);

  // Apply transformations
  if (crop === 'fill') {
    img.resize(fill().width(width).height(height).gravity(gravity === 'auto' ? autoGravity() : gravity));
  }

  img
    .delivery(format(auto()))
    .delivery(quality(autoQuality()));

  return (
    <AdvancedImage
      cldImg={img}
      alt={alt}
      className={className}
      plugins={[lazyload(), responsive(), placeholder()]}
    />
  );
};

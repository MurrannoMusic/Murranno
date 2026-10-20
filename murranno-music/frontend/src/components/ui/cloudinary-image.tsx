// Media now lives in R2 (served by the API at /media/<key>); `publicId` is the file's URL.
// The name and props are kept so existing callers don't change.
interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit';
  gravity?: 'auto' | 'face' | 'center';
  className?: string;
}

export const CloudinaryImage = ({ publicId, alt, width = 800, height = 800, crop = 'fill', className }: CloudinaryImageProps) => (
  <img
    src={publicId}
    alt={alt}
    width={width}
    height={height}
    loading="lazy"
    decoding="async"
    className={className}
    style={{ objectFit: crop === 'fit' ? 'contain' : 'cover', aspectRatio: `${width} / ${height}` }}
  />
);

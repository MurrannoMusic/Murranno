import { useRef, useState } from 'react';
import { Camera, User, ImageIcon, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { useCamera } from '@/hooks/useCamera';
import { isNativeApp } from '@/utils/platformDetection';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/canvasUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ProfileImageUploadProps {
  imageUrl: string | null;
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export const ProfileImageUpload = ({ imageUrl, onImageSelect, disabled }: ProfileImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { takePhoto, pickFromGallery, isCapturing } = useCamera();
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleClick = () => {
    if (!disabled && !isNativeApp()) {
      fileInputRef.current?.click();
    }
  };

  const processFileForCrop = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || null);
      setIsCropping(true);
      setZoom(1);
      setRotation(0);
    });
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileForCrop(file);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleTakePhoto = async () => {
    const file = await takePhoto();
    if (file) {
      processFileForCrop(file);
    }
  };

  const handlePickFromGallery = async () => {
    const file = await pickFromGallery();
    if (file) {
      processFileForCrop(file);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCrop = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
        if (croppedImage) {
          const file = new File([croppedImage], 'avatar.jpg', { type: 'image/jpeg' });
          onImageSelect(file);
          setIsCropping(false);
          setImageSrc(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Extract public ID from Cloudinary URL if present
  const getPublicIdFromUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length > 1) {
        const pathParts = parts[1].split('/');
        // Remove version (v1234567890) and get the rest
        const publicIdParts = pathParts.filter(p => !p.startsWith('v'));
        return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension
      }
    }
    return null;
  };

  const publicId = getPublicIdFromUrl(imageUrl);

  return (
    <>
      <div className="relative group">
        {isNativeApp() && !disabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`relative w-16 h-16 cursor-pointer`}>
                <Avatar className="w-16 h-16 border-2 border-border">
                  {publicId ? (
                    <div className="w-full h-full overflow-hidden rounded-full">
                      <CloudinaryImage
                        publicId={publicId}
                        alt="Profile"
                        width={64}
                        height={64}
                        crop="fill"
                        gravity="face"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <AvatarImage src={imageUrl || undefined} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                {!disabled && (
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleTakePhoto} disabled={isCapturing}>
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePickFromGallery} disabled={isCapturing}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose from Gallery
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBrowseFiles}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Browse Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div
            onClick={handleClick}
            className={`relative w-16 h-16 ${!disabled && 'cursor-pointer'}`}
          >
            <Avatar className="w-16 h-16 border-2 border-border">
              {publicId ? (
                <div className="w-full h-full overflow-hidden rounded-full">
                  <CloudinaryImage
                    publicId={publicId}
                    alt="Profile"
                    width={64}
                    height={64}
                    crop="fill"
                    gravity="face"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <>
                  <AvatarImage src={imageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                </>
              )}
            </Avatar>

            {!disabled && (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      <Dialog open={isCropping} onOpenChange={setIsCropping}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-64 bg-black/90 rounded-lg overflow-hidden my-4">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
                showGrid={false}
                cropShape="round"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation((r) => r + 90)}
                className="gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCropping(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCrop}>
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

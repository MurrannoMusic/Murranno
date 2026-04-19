import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PromotionService } from '@/types/promotion';
import { Check, ShoppingCart, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ServiceCardProps {
  service: PromotionService;
  onSelect: (service: PromotionService) => void;
}

export const ServiceCard = ({ service, onSelect }: ServiceCardProps) => {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(service.id);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isProcessing = isBuyingNow || isAddingToCart;

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      await onSelect(service);
      toast.success('Proceeding to checkout', {
        description: `${service.name} - ${formatPrice(service.price)}`,
      });
    } catch (error) {
      toast.error('Failed to process purchase');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart(service);
      toast.success('Added to cart', {
        description: service.name,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    setIsAddingToCart(true);
    try {
      await removeFromCart(service.id);
      toast.success('Removed from cart', {
        description: service.name,
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const displayImages = service.images && service.images.length > 0
    ? service.images
    : service.imageUrl
      ? [service.imageUrl]
      : [];

  const displayVideos = service.videos || [];
  const hasMedia = displayImages.length > 0 || displayVideos.length > 0;
  const allMedia = [...displayImages, ...displayVideos];

  return (
    <Card className="flex flex-col h-full hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden group">
      {hasMedia ? (
        <div className="w-full aspect-video overflow-hidden relative bg-black/5">
          {allMedia.length === 1 ? (
            displayVideos.length > 0 ? (
              <video
                src={displayVideos[0]}
                controls
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              (displayImages[0].startsWith('/') || displayImages[0].startsWith('http')) ? (
                <img
                  src={displayImages[0]}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <CloudinaryImage
                  publicId={displayImages[0]}
                  alt={service.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              )
            )
          ) : (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {displayImages.map((image, index) => (
                  <CarouselItem key={`img-${index}`}>
                    {(image.startsWith('/') || image.startsWith('http')) ? (
                      <img
                        src={image}
                        alt={`${service.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <CloudinaryImage
                        publicId={image}
                        alt={`${service.name} - Image ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </CarouselItem>
                ))}
                {displayVideos.map((video, index) => (
                  <CarouselItem key={`vid-${index}`}>
                    <video
                      src={video}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-black/20 hover:bg-black/40 border-none text-white h-7 w-7" />
              <CarouselNext className="right-2 bg-black/20 hover:bg-black/40 border-none text-white h-7 w-7" />
            </Carousel>
          )}

          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-[10px] font-medium bg-background/80 backdrop-blur-md shadow-sm border border-white/10">
              {service.category}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-secondary/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
          <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-[10px] font-medium bg-background/80 backdrop-blur-md shadow-sm">
              {service.category}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-base font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-[10px] mt-1">{service.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 px-3 py-0 space-y-3">
        <div className="flex items-end justify-between border-b border-border/40 pb-2">
          <div className="text-lg font-bold text-foreground">
            {formatPrice(service.price)}
          </div>
          {service.duration && (
            <div className="text-[10px] text-muted-foreground font-medium bg-secondary/30 px-1.5 py-0.5 rounded-full">
              {service.duration}
            </div>
          )}
        </div>

        {service.features && service.features.length > 0 && (
          <ul className="space-y-1">
            {service.features.slice(0, 2).map((feature, index) => (
              <li key={index} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </li>
            ))}
            {service.features.length > 2 && (
              <li className="text-[10px] text-muted-foreground pl-4 italic">
                + {service.features.length - 2} more features
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className="p-3 grid grid-cols-[1fr_auto] gap-2 mt-auto">
        <Button
          onClick={handleBuyNow}
          variant="default"
          size="sm"
          className="w-full h-8 text-xs font-bold"
          disabled={isProcessing}
        >
          {isBuyingNow ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Book Now"
          )}
        </Button>

        {inCart ? (
          <Button
            onClick={handleRemoveFromCart}
            variant="outline"
            size="sm"
            className="w-8 h-8 px-0 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            disabled={isProcessing}
            title="Remove from Cart"
          >
            {isAddingToCart ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
        ) : (
          <Button
            onClick={handleAddToCart}
            variant="secondary"
            size="sm"
            className="w-8 h-8 px-0"
            disabled={isProcessing}
            title="Add to Cart"
          >
            {isAddingToCart ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ShoppingCart className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

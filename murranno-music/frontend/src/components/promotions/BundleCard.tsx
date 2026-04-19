import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CloudinaryImage } from '@/components/ui/cloudinary-image';
import { PromotionBundle } from '@/types/promotion';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface BundleCardProps {
  bundle: PromotionBundle;
  onSelect: (bundle: PromotionBundle) => void;
  isRecommended?: boolean;
}

export const BundleCard = ({ bundle, onSelect, isRecommended }: BundleCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTierCofig = (tierLevel: number) => {
    switch (tierLevel) {
      case 1: return { color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5', glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]' };
      case 2: return { color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' };
      case 3: return { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5', glow: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]' };
      case 4: return { color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5', glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]' };
      default: return { color: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/5', glow: '' };
    }
  };

  const theme = getTierCofig(bundle.tierLevel);
  const isHighlighted = isRecommended || bundle.tierLevel > 2;

  return (
    <Card className={`flex flex-col h-full relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 ${theme.border} ${theme.bg} ${theme.glow} backdrop-blur-md border`}>
      {isRecommended && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md">
            <Sparkles className="h-3 w-3 inline-block mr-1 mb-0.5" />
            Recommended
          </div>
        </div>
      )}

      {/* Decorative gradient blob */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-20 bg-current ${theme.color}`} />

      {bundle.imageUrl && (
        <div className="w-full h-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
          {(bundle.imageUrl.startsWith('/') || bundle.imageUrl.startsWith('http')) ? (
            <img
              src={bundle.imageUrl}
              alt={bundle.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              loading="lazy"
            />
          ) : (
            <CloudinaryImage
              publicId={bundle.imageUrl}
              alt={bundle.name}
              width={600}
              height={300}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
          )}
        </div>
      )}

      <CardHeader className="relative z-20 pb-1.5 pt-4 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={`${theme.color} ${theme.border} bg-background/50 backdrop-blur-sm text-[10px] h-5 px-2`}>
            Tier {bundle.tierLevel}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">{bundle.name}</CardTitle>
        {bundle.description && (
          <CardDescription className="line-clamp-2 text-xs">{bundle.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3 relative z-20 px-4">
        <div>
          <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 ${theme.color}`}>
            {formatPrice(bundle.price)}
          </div>
        </div>

        {bundle.targetDescription && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-white/5 backdrop-blur-sm">
            <span className="text-base">🎯</span>
            <p className="text-xs font-medium leading-tight opacity-90">{bundle.targetDescription}</p>
          </div>
        )}

        {bundle.includedServices && bundle.includedServices.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold flex items-center gap-2 text-muted-foreground">
              Examples of included services:
            </div>
            <ul className="space-y-1.5">
              {bundle.includedServices.slice(0, 3).map((service) => (
                <li key={service.id} className="flex items-start gap-2 text-xs">
                  <div className={`mt-0.5 p-0.5 rounded-full ${theme.color} bg-current/10`}>
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="opacity-90 line-clamp-1">{service.name}</span>
                </li>
              ))}
            </ul>
            {bundle.includedServices.length > 3 && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleContent className="space-y-1.5 mt-1.5">
                  <ul className="space-y-1.5">
                    {bundle.includedServices.slice(3).map((service) => (
                      <li key={service.id} className="flex items-start gap-2 text-xs">
                        <div className={`mt-0.5 p-0.5 rounded-full ${theme.color} bg-current/10`}>
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="opacity-90 line-clamp-1">{service.name}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
                <CollapsibleTrigger className="flex items-center justify-center w-full text-[10px] font-medium text-muted-foreground hover:text-foreground mt-1.5 py-0.5 transition-colors">
                  {isOpen ? 'Show Less' : `+ ${bundle.includedServices.length - 3} more services`}
                  <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-4 px-4 relative z-20">
        <Button
          onClick={() => onSelect(bundle)}
          className={`w-full h-9 text-xs font-bold shadow-lg transition-all ${isRecommended ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80'}`}
          variant="default"
        >
          Select Package
        </Button>
      </CardFooter>
    </Card>
  );
};

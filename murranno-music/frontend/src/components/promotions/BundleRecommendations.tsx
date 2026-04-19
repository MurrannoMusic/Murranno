import { useMemo } from 'react';
import { PromotionService, PromotionBundle } from '@/types/promotion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface BundleRecommendation {
  bundle: PromotionBundle;
  matchingServices: PromotionService[];
  matchPercentage: number;
  savings: number;
  totalServicesValue: number;
}

interface BundleRecommendationsProps {
  cartServices: PromotionService[];
  cartTotal: number;
  bundles: PromotionBundle[];
  onSelectBundle: (bundle: PromotionBundle) => void;
}

export const BundleRecommendations = ({
  cartServices,
  cartTotal,
  bundles,
  onSelectBundle,
}: BundleRecommendationsProps) => {
  const recommendations = useMemo(() => {
    if (cartServices.length === 0 || bundles.length === 0) return [];

    const cartServiceIds = new Set(cartServices.map(s => s.id));
    
    const analyzed: BundleRecommendation[] = bundles
      .map(bundle => {
        const includedServices = bundle.includedServices || [];
        const matchingServices = includedServices.filter(s => 
          cartServiceIds.has(s.id)
        );
        
        const matchPercentage = includedServices.length > 0
          ? (matchingServices.length / includedServices.length) * 100
          : 0;
        
        const totalServicesValue = includedServices.reduce(
          (sum, s) => sum + s.price,
          0
        );
        
        const savings = cartTotal - bundle.price;
        
        return {
          bundle,
          matchingServices,
          matchPercentage,
          savings,
          totalServicesValue,
        };
      })
      .filter(rec => 
        // Only show bundles that:
        // 1. Have at least 1 matching service
        // 2. Would save money compared to cart total
        rec.matchingServices.length > 0 && rec.savings > 0
      )
      .sort((a, b) => b.savings - a.savings); // Sort by highest savings first

    return analyzed.slice(0, 2); // Show top 2 recommendations
  }, [cartServices, cartTotal, bundles]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Save Money with Bundles</h3>
      </div>
      
      {recommendations.map((rec) => (
        <Card 
          key={rec.bundle.id} 
          className="p-4 space-y-3 border-primary/20 bg-primary/5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">{rec.bundle.name}</h4>
              {rec.bundle.targetDescription && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {rec.bundle.targetDescription}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="shrink-0">
              <TrendingDown className="h-3 w-3 mr-1" />
              Save {formatCurrency(rec.savings)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">Bundle price:</span>
              <span className="font-bold text-lg">{formatCurrency(rec.bundle.price)}</span>
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(rec.totalServicesValue)}
              </span>
            </div>

            {rec.matchingServices.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Includes {rec.matchingServices.length} service{rec.matchingServices.length !== 1 ? 's' : ''} from your cart:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {rec.matchingServices.map(service => (
                      <Badge 
                        key={service.id} 
                        variant="outline" 
                        className="text-xs"
                      >
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => onSelectBundle(rec.bundle)}
            size="sm"
            className="w-full"
            variant="default"
          >
            Switch to this Bundle
          </Button>
        </Card>
      ))}
    </div>
  );
};

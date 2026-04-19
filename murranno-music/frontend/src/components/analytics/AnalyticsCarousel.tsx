import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Music, TrendingUp, Store, Trophy } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsCard {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  gradient: string;
}

export const AnalyticsCarousel = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useAnalyticsData('7');

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const analyticsData: AnalyticsCard[] = data ? [
    {
      title: 'Streams This Week',
      value: data.totalStreams.toLocaleString(),
      subtext: `Across all stores • ${getDateRange()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-primary/20 to-primary/5',
    },
    ...(data.bestPlatform ? [{
      title: 'Best Store',
      value: data.bestPlatform.name,
      subtext: `${data.bestPlatform.streams.toLocaleString()} Streams`,
      icon: <Store className="h-5 w-5" />,
      gradient: 'from-accent/20 to-accent/5',
    }] : []),
    ...(data.topTracks.length > 0 ? [{
      title: 'Most Streamed Track',
      value: data.topTracks[0].title,
      subtext: `${data.topTracks[0].release} – ${data.topTracks[0].streams.toLocaleString()} Streams`,
      icon: <Trophy className="h-5 w-5" />,
      gradient: 'from-primary/20 to-primary/5',
    }] : []),
    ...(data.topCountry ? [{
      title: 'Top Country',
      value: data.topCountry.name,
      subtext: `${data.topCountry.streams.toLocaleString()} Streams`,
      icon: <Music className="h-5 w-5" />,
      gradient: 'from-success/20 to-success/5',
    }] : []),
  ] : [];

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/20">
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || analyticsData.length === 0) {
    return (
      <Card className="border-border/20">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload your music and start getting streams to see your performance insights here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: analyticsData.length > 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {analyticsData.map((card, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-[85%] md:basis-1/2 lg:basis-1/3">
              <Card className="h-full border-border/20 overflow-hidden shadow-md">
                <CardContent className={`p-5 h-full bg-gradient-to-br ${card.gradient}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-background/80 backdrop-blur-sm rounded-xl">
                      {card.icon}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </h3>
                    <div className="text-2xl font-bold text-foreground">
                      {card.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.subtext}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Pagination Dots */}
        {analyticsData.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {analyticsData.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  );
};

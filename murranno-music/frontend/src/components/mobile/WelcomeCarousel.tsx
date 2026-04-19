import { useState, useEffect } from 'react';
import { ChevronRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import prototypeOne from '@/assets/prototype-1.jpg';
import prototypeTwo from '@/assets/prototype-2.jpg';
import prototypeThree from '@/assets/prototype-3.jpg';

interface SlideProps {
  title: string;
  description: string;
  backgroundImage: string;
}

const slides: SlideProps[] = [
  {
    title: "Distribute Your Music Globally",
    description: "Upload once and reach all major streaming platforms including Spotify, Apple Music, Boomplay, and more.",
    backgroundImage: prototypeOne
  },
  {
    title: "Promote & Grow Your Fanbase",
    description: "Run targeted campaigns, playlist pitching, and influencer partnerships to amplify your reach.",
    backgroundImage: prototypeTwo
  },
  {
    title: "Track Royalties & Get Paid Fast",
    description: "Real-time analytics, transparent earnings, and fast payouts to your bank or mobile money wallet.",
    backgroundImage: prototypeThree
  }
];

interface WelcomeCarouselProps {
  onComplete?: () => void;
  compact?: boolean;
}

export const WelcomeCarousel = ({ onComplete, compact = false }: WelcomeCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  // Autoplay functionality
  useEffect(() => {
    if (isAutoplayPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev < slides.length - 1) {
          return prev + 1;
        }
        return 0; // Loop back to first slide
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoplayPaused]);

  const minSwipeDistance = 50;

  const nextSlide = () => {
    setIsAutoplayPaused(true); // Pause autoplay when user manually navigates
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const previousSlide = () => {
    setIsAutoplayPaused(true); // Pause autoplay when user manually navigates
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipToEnd = () => {
    setIsAutoplayPaused(true);
    onComplete();
  };

  const goToSlide = (index: number) => {
    setIsAutoplayPaused(true); // Pause autoplay when user clicks a dot
    setCurrentSlide(index);
  };

  const toggleAutoplay = () => {
    setIsAutoplayPaused(!isAutoplayPaused);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    setIsAutoplayPaused(true); // Pause autoplay on swipe
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      previousSlide();
    }
  };

  return (
    <div 
      className={`${compact ? 'h-[calc(100vh-110px)]' : 'min-h-screen'} flex flex-col relative overflow-hidden ${compact ? 'rounded-t-3xl' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images */}
      {slides.map((slide, index) => (
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          } ${compact ? 'rounded-t-3xl' : ''}`}
          style={{
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      <div className={`relative z-10 flex-1 flex flex-col justify-end items-center ${compact ? 'px-4 py-4' : 'px-6 py-8'}`}>
        <div className="w-full max-w-sm overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 px-2"
              >
                <Card className="backdrop-blur-xl bg-black/30 border-white/20">
                  <div className={`${compact ? 'p-4' : 'p-8'} text-center ${compact ? 'space-y-2' : 'space-y-6'}`}>
                    <div className={compact ? 'space-y-2' : 'space-y-4'}>
                      <h2 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-white leading-tight drop-shadow-lg`}>
                        {slide.title}
                      </h2>
                      <p className={`text-white/90 ${compact ? 'text-sm' : 'text-base'} leading-relaxed drop-shadow-md`}>
                        {slide.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicators with pause/play button */}
        <div className={`flex items-center gap-3 ${compact ? 'mt-3' : 'mt-8'}`}>
          {/* Pause/Play button */}
          <button
            onClick={toggleAutoplay}
            className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
            aria-label={isAutoplayPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isAutoplayPaused ? (
              <Play className="w-3 h-3 text-white fill-white" />
            ) : (
              <Pause className="w-3 h-3 text-white fill-white" />
            )}
          </button>

          {/* Progress dots */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                  index === currentSlide ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Compact mode navigation */}
        {compact && currentSlide < slides.length - 1 && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={nextSlide}
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Navigation - Only show in full mode */}
      {!compact && (
        <div className="relative z-10 p-6 space-y-4">
          <Button 
            onClick={nextSlide}
            className="w-full gradient-primary music-button shadow-primary"
            size="lg"
          >
            {currentSlide < slides.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              'Get Started'
            )}
          </Button>
          
          {currentSlide < slides.length - 1 && (
            <Button 
              onClick={skipToEnd}
              variant="ghost" 
              className="w-full text-white hover:text-white hover:bg-white/10"
            >
              Skip
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
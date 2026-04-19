import { Link, useNavigate } from 'react-router-dom';
import { WelcomeCarousel } from '@/components/mobile/WelcomeCarousel';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

export const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Default to 'artist' tier for direct signup
    navigate('/signup', { state: { tier: 'artist' } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Carousel without internal navigation */}
      <div className="flex-1">
        <WelcomeCarousel compact />
      </div>

      {/* Fixed bottom CTA area with proper z-index */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-6 pt-16 bg-gradient-to-t from-background via-background to-transparent">
        <div className="space-y-4">
          <Button
            onClick={handleGetStarted}
            className="w-full gradient-primary music-button shadow-primary relative"
            size="lg"
          >
            <span className="flex items-center justify-center gap-2">
              Get Started
              <ChevronUp className="w-5 h-5 animate-bounce" />
            </span>
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

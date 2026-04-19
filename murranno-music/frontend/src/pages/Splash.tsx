import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedLogo } from '@/components/splash/AnimatedLogo';
import { FloatingParticles } from '@/components/splash/FloatingParticles';

export const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/signup');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-mesh flex items-center justify-center">
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-30 animate-pulse" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        {/* Animated logo */}
        <AnimatedLogo />

        {/* App name with gradient */}
        <h1 className="mt-8 text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          Murranno
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
          Distribute. Promote. Earn.
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50" />
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      
      {/* Purple/Blue gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-primary/5 to-transparent" />
      
      {/* Geometric shape accents with glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
            Your Music to the World
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Empowering Artists Worldwide with Digital Music Distribution and Promotions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold"
            >
              <Link to="/releases">Distribute</Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-6 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg font-semibold"
            >
              <Link to="/promotions">Promote</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

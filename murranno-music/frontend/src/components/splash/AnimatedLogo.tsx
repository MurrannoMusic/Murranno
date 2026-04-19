// Using favicon from public folder

export const AnimatedLogo = () => {
  return (
    <div className="relative animate-scale-in">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }} />
      
      {/* Main logo container */}
      <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 shadow-elegant">
        {/* Inner gradient overlay */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-background/10 to-transparent" />
        
        {/* Murranno logo */}
        <img src="/favicon.png" alt="Murranno Music" className="relative z-10 w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg" />
        
        {/* Rotating ring accent */}
        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-glow" />
        </div>
      </div>
    </div>
  );
};

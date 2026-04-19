import audiomackLogo from "@/assets/platforms/audiomack.svg";
import tidalLogo from "@/assets/platforms/tidal.svg";
import wynkLogo from "@/assets/platforms/wynk.svg";
import soundcloudLogo from "@/assets/platforms/soundcloud.svg";
import pandoraLogo from "@/assets/platforms/pandora2.svg";
import napsterLogo from "@/assets/platforms/napster.svg";
import spotifyLogo from "@/assets/platforms/spotify.svg";
import appleMusicLogo from "@/assets/platforms/apple-music.svg";
import youtubeMusicLogo from "@/assets/platforms/youtube-music.svg";
import deezerLogo from "@/assets/platforms/deezer.svg";
import amazonMusicLogo from "@/assets/platforms/amazon-music.svg";
import boomplayLogo from "@/assets/platforms/boomplay.svg";

export const PlatformLogos = () => {
  const platforms = [
    { name: "Audiomack", logo: audiomackLogo },
    { name: "Tidal", logo: tidalLogo },
    { name: "Wynk Music", logo: wynkLogo },
    { name: "SoundCloud", logo: soundcloudLogo },
    { name: "Pandora", logo: pandoraLogo },
    { name: "Napster", logo: napsterLogo },
    { name: "Spotify", logo: spotifyLogo },
    { name: "Apple Music", logo: appleMusicLogo },
    { name: "YouTube Music", logo: youtubeMusicLogo },
    { name: "Deezer", logo: deezerLogo },
    { name: "Amazon Music", logo: amazonMusicLogo },
    { name: "Boomplay", logo: boomplayLogo },
  ];

  // Duplicate platforms for seamless infinite scroll
  const duplicatedPlatforms = [...platforms, ...platforms, ...platforms];

  return (
    <div className="w-full relative overflow-hidden py-12 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400">
      {/* Wavy bottom border with animation */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-background animate-wave" style={{
        clipPath: 'polygon(0 60%, 5% 55%, 10% 50%, 15% 45%, 20% 50%, 25% 55%, 30% 50%, 35% 45%, 40% 50%, 45% 55%, 50% 50%, 55% 45%, 60% 50%, 65% 55%, 70% 50%, 75% 45%, 80% 50%, 85% 55%, 90% 50%, 95% 55%, 100% 60%, 100% 100%, 0 100%)'
      }} />
      
      <div className="relative">
        {/* Gradient overlays for fade effect on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-purple-600 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-cyan-400 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container - pauses on hover */}
        <div className="flex gap-20 items-center animate-scroll hover:pause-animation px-8">
          {duplicatedPlatforms.map((platform, index) => (
            <div 
              key={index}
              className="flex-shrink-0 transition-transform hover:scale-110 duration-300"
            >
              <img 
                src={platform.logo} 
                alt={platform.name}
                className="h-10 w-auto object-contain brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .animate-scroll {
          animation: scroll 25s linear infinite;
          display: flex;
        }
        
        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }
        
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

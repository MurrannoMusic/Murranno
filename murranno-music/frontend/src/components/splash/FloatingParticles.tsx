import { Music, Radio, Disc3, Mic2, Headphones } from 'lucide-react';

const particles = [
  { Icon: Music, top: '10%', left: '15%', delay: '0s', duration: '8s' },
  { Icon: Radio, top: '20%', left: '80%', delay: '1s', duration: '10s' },
  { Icon: Disc3, top: '60%', left: '10%', delay: '2s', duration: '12s' },
  { Icon: Mic2, top: '70%', left: '85%', delay: '0.5s', duration: '9s' },
  { Icon: Headphones, top: '40%', left: '90%', delay: '1.5s', duration: '11s' },
  { Icon: Music, top: '80%', left: '20%', delay: '2.5s', duration: '10s' },
  { Icon: Radio, top: '15%', left: '70%', delay: '3s', duration: '13s' },
  { Icon: Disc3, top: '50%', left: '5%', delay: '1s', duration: '9s' },
];

export const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => {
        const Icon = particle.Icon;
        return (
          <div
            key={index}
            className="absolute animate-float opacity-20"
            style={{
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          >
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" strokeWidth={1.5} />
          </div>
        );
      })}
    </div>
  );
};

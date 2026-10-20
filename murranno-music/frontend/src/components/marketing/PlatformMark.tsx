import spotify from '@/assets/platforms/spotify.svg';
import apple from '@/assets/platforms/apple-music.svg';
import youtube from '@/assets/platforms/youtube-music.svg';
import boomplay from '@/assets/platforms/boomplay.png';
import audiomack from '@/assets/platforms/audiomack.svg';
import deezer from '@/assets/platforms/deezer.png';
import amazon from '@/assets/platforms/amazon-music.png';
import tidal from '@/assets/platforms/tidal.svg';

const platforms = {
  spotify: { src: spotify, name: 'Spotify', monochrome: true },
  apple: { src: apple, name: 'Apple Music', monochrome: true },
  youtube: { src: youtube, name: 'YouTube Music', monochrome: true },
  boomplay: { src: boomplay, name: 'Boomplay', monochrome: false },
  audiomack: { src: audiomack, name: 'Audiomack', monochrome: true },
  deezer: { src: deezer, name: 'Deezer', monochrome: false },
  amazon: { src: amazon, name: 'Amazon Music', monochrome: false },
  tidal: { src: tidal, name: 'Tidal', monochrome: true },
};

export type PlatformName = keyof typeof platforms;

/** White SVG marks need dark ink on the marketing pages' light surfaces. */
export function PlatformMark({ platform, decorative = false }: { platform: PlatformName; decorative?: boolean }) {
  const { src, name, monochrome } = platforms[platform];
  return <img className={`mm-platform-mark${monochrome ? ' mm-platform-mark-mono' : ''}`} src={src} alt={decorative ? '' : name} title={name} />;
}

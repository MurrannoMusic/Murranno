import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { useHaptics } from '@/hooks/useHaptics';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import { useFilesystem } from '@/hooks/useFilesystem';
import { ScreenOrientation } from '@capacitor/screen-orientation';

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  trackTitle?: string;
  artistName?: string;
  coverArt?: string;
  className?: string;
}

export const EnhancedAudioPlayer = ({ 
  audioUrl, 
  trackTitle = 'Untitled Track',
  artistName = 'Unknown Artist',
  coverArt,
  className 
}: EnhancedAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const { lock, unlock, isLandscape } = useScreenOrientation();
  const { buttonPress, success } = useHaptics();
  const { isActive } = useAppLifecycle();
  const { cacheAudioFile, getCachedAudioPath } = useFilesystem();

  // Cache audio file on mount
  useEffect(() => {
    const loadAudio = async () => {
      const filename = audioUrl.split('/').pop() || 'track.mp3';
      const cachedPath = await getCachedAudioPath(filename);
      
      if (!cachedPath) {
        await cacheAudioFile(audioUrl, filename);
      }
    };
    
    loadAudio();
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      success();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Pause audio when app goes to background
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isActive && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Audio visualization
  useEffect(() => {
    if (!isFullscreen || !canvasRef.current || !audioRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'hsl(var(--background))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, 'hsl(var(--primary))');
        gradient.addColorStop(1, 'hsl(var(--primary-glow))');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    if (isPlaying) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isFullscreen, isPlaying]);

  const togglePlay = () => {
    buttonPress();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      success();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    buttonPress();
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    buttonPress();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  const skipBackward = () => {
    buttonPress();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  const toggleFullscreen = async () => {
    buttonPress();
    if (!isFullscreen) {
      await lock('landscape' as any);
      setIsFullscreen(true);
      success();
    } else {
      await unlock();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        <audio ref={audioRef} src={audioUrl} />
        
        {/* Visualization Canvas */}
        <div className="flex-1 relative">
          <canvas 
            ref={canvasRef} 
            width={window.innerWidth}
            height={window.innerHeight * 0.6}
            className="w-full h-full"
          />
          
          {/* Overlay Info */}
          <div className="absolute top-8 left-8 right-8 flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-foreground animate-slide-in-right">
                {trackTitle}
              </h2>
              <p className="text-xl text-muted-foreground animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                {artistName}
              </p>
            </div>
            <Button
              size="lg"
              variant="ghost"
              onClick={toggleFullscreen}
              className="h-12 w-12 p-0"
            >
              <Minimize2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="p-8 space-y-6 bg-gradient-to-t from-background to-background/95 backdrop-blur">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-6">
            <Button
              size="lg"
              variant="outline"
              onClick={skipBackward}
              className="h-14 w-14 rounded-full"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlay}
              className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 hover-scale"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={skipForward}
              className="h-14 w-14 rounded-full"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-10 w-10 p-0"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="cursor-pointer flex-1"
            />
          </div>
        </div>
      </div>
    );
  }

  // Normal/Compact View
  return (
    <div className={cn('space-y-3 p-4 bg-muted/30 rounded-lg', className)}>
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Track Info */}
      {(trackTitle || artistName) && (
        <div className="flex items-center gap-3">
          {coverArt && (
            <img 
              src={coverArt} 
              alt={trackTitle}
              className="h-12 w-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{trackTitle}</p>
            <p className="text-xs text-muted-foreground truncate">{artistName}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 shrink-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlay}
          className="h-8 w-8 p-0 shrink-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-24 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

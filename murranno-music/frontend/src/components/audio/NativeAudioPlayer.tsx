import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNativeAudio } from '@/hooks/useNativeAudio';
import { useHaptics } from '@/hooks/useHaptics';

interface NativeAudioPlayerProps {
  audioUrl: string;
  trackTitle?: string;
  artistName?: string;
  coverArt?: string;
  assetId: string;
  className?: string;
}

export const NativeAudioPlayer = ({ 
  audioUrl, 
  trackTitle = 'Untitled Track',
  artistName = 'Unknown Artist',
  coverArt,
  assetId,
  className 
}: NativeAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const {
    isNativeAvailable,
    preloadAudio,
    play,
    pause,
    stop,
    setVolume: setNativeVolume,
    getDuration,
    getCurrentTime,
  } = useNativeAudio();
  
  const { buttonPress, success } = useHaptics();

  // Preload audio on mount
  useEffect(() => {
    const loadAudio = async () => {
      const loaded = await preloadAudio(assetId, audioUrl);
      setIsReady(loaded);
      
      if (loaded) {
        const audioDuration = await getDuration(assetId);
        if (audioDuration) {
          setDuration(audioDuration);
        }
      }
    };

    if (isNativeAvailable) {
      loadAudio();
    }
  }, [assetId, audioUrl, isNativeAvailable]);

  // Update current time while playing
  useEffect(() => {
    if (!isPlaying || !isNativeAvailable) return;

    const interval = setInterval(async () => {
      const time = await getCurrentTime(assetId);
      if (time !== null) {
        setCurrentTime(time);
        
        // Auto-stop at end
        if (time >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          await stop(assetId);
          success();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration, assetId, isNativeAvailable]);

  const togglePlay = useCallback(async () => {
    buttonPress();
    
    if (isPlaying) {
      await pause(assetId);
      setIsPlaying(false);
    } else {
      await play(assetId, currentTime);
      setIsPlaying(true);
      success();
    }
  }, [isPlaying, assetId, currentTime]);

  const handleSeek = useCallback(async (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    if (isPlaying) {
      await pause(assetId);
      await play(assetId, newTime);
    }
  }, [assetId, isPlaying]);

  const handleVolumeChange = useCallback(async (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    await setNativeVolume(assetId, newVolume);
    setIsMuted(newVolume === 0);
  }, [assetId]);

  const toggleMute = useCallback(async () => {
    buttonPress();
    
    if (isMuted) {
      await setNativeVolume(assetId, volume);
      setIsMuted(false);
    } else {
      await setNativeVolume(assetId, 0);
      setIsMuted(true);
    }
  }, [isMuted, volume, assetId]);

  const skipForward = useCallback(async () => {
    buttonPress();
    const newTime = Math.min(currentTime + 10, duration);
    setCurrentTime(newTime);
    
    if (isPlaying) {
      await pause(assetId);
      await play(assetId, newTime);
    }
  }, [currentTime, duration, assetId, isPlaying]);

  const skipBackward = useCallback(async () => {
    buttonPress();
    const newTime = Math.max(currentTime - 10, 0);
    setCurrentTime(newTime);
    
    if (isPlaying) {
      await pause(assetId);
      await play(assetId, newTime);
    }
  }, [currentTime, assetId, isPlaying]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isNativeAvailable || !isReady) {
    return null;
  }

  return (
    <div className={cn('space-y-3 p-4 bg-muted/30 rounded-lg', className)}>
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
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={skipBackward}
          className="h-8 w-8 p-0 shrink-0"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlay}
          className="h-8 w-8 p-0 shrink-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={skipForward}
          className="h-8 w-8 p-0 shrink-0"
        >
          <SkipForward className="h-4 w-4" />
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

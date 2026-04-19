import { useState, useEffect } from 'react';
import { NativeAudio } from '@capacitor-community/native-audio';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

interface AudioTrack {
  assetId: string;
  url: string;
  volume?: number;
  isLooping?: boolean;
}

export const useNativeAudio = () => {
  const [loadedTracks, setLoadedTracks] = useState<Set<string>>(new Set());
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const preloadAudio = async (assetId: string, url: string): Promise<boolean> => {
    if (!isNativeApp()) {
      return false;
    }

    try {
      await NativeAudio.preload({
        assetId,
        assetPath: url,
        audioChannelNum: 1,
        isUrl: true,
      });
      
      setLoadedTracks(prev => new Set(prev).add(assetId));
      return true;
    } catch (error) {
      console.error('Failed to preload audio:', error);
      return false;
    }
  };

  const play = async (assetId: string, time: number = 0): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.play({
        assetId,
        time,
      });
      setPlayingTrackId(assetId);
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast.error('Failed to play audio');
    }
  };

  const pause = async (assetId: string): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.pause({ assetId });
      setPlayingTrackId(null);
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  };

  const stop = async (assetId: string): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.stop({ assetId });
      setPlayingTrackId(null);
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  };

  const setVolume = async (assetId: string, volume: number): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.setVolume({
        assetId,
        volume: Math.max(0, Math.min(1, volume)), // Clamp between 0 and 1
      });
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const unload = async (assetId: string): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.unload({ assetId });
      setLoadedTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(assetId);
        return newSet;
      });
      if (playingTrackId === assetId) {
        setPlayingTrackId(null);
      }
    } catch (error) {
      console.error('Failed to unload audio:', error);
    }
  };

  const getDuration = async (assetId: string): Promise<number | null> => {
    if (!isNativeApp()) {
      return null;
    }

    try {
      const result = await NativeAudio.getDuration({ assetId });
      return result.duration;
    } catch (error) {
      console.error('Failed to get duration:', error);
      return null;
    }
  };

  const getCurrentTime = async (assetId: string): Promise<number | null> => {
    if (!isNativeApp()) {
      return null;
    }

    try {
      const result = await NativeAudio.getCurrentTime({ assetId });
      return result.currentTime;
    } catch (error) {
      console.error('Failed to get current time:', error);
      return null;
    }
  };

  const loop = async (assetId: string): Promise<void> => {
    if (!isNativeApp()) {
      return;
    }

    try {
      await NativeAudio.loop({ assetId });
    } catch (error) {
      console.error('Failed to set loop:', error);
    }
  };

  // Cleanup all loaded tracks on unmount
  useEffect(() => {
    return () => {
      if (isNativeApp()) {
        loadedTracks.forEach(assetId => {
          NativeAudio.unload({ assetId }).catch(console.error);
        });
      }
    };
  }, []);

  return {
    isNativeAvailable: isNativeApp(),
    loadedTracks: Array.from(loadedTracks),
    playingTrackId,
    preloadAudio,
    play,
    pause,
    stop,
    setVolume,
    unload,
    getDuration,
    getCurrentTime,
    loop,
  };
};

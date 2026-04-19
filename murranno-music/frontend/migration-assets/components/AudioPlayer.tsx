/**
 * React Native Audio Player Component
 * Full-featured audio player for track previews
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react-native';

interface Track {
  id: string;
  title: string;
  artistName: string;
  audioUrl: string;
  coverArtUrl?: string;
  duration: number;
}

interface AudioPlayerProps {
  track: Track;
  onNext?: () => void;
  onPrevious?: () => void;
  showControls?: boolean;
  mini?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onNext,
  onPrevious,
  showControls = true,
  mini = false,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Configure audio mode
  useEffect(() => {
    const configureAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };
    configureAudio();
  }, []);

  // Load audio when track changes
  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [track.audioUrl]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Auto-play next track when finished
      if (status.didJustFinish && onNext) {
        onNext();
      }
    }
  };

  const togglePlayPause = useCallback(async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [sound, isPlaying]);

  const handleSeek = useCallback(async (value: number) => {
    if (!sound) return;
    
    try {
      await sound.setPositionAsync(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [sound]);

  const toggleMute = useCallback(async () => {
    if (!sound) return;
    
    try {
      await sound.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [sound, isMuted]);

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mini player variant
  if (mini) {
    return (
      <View className="flex-row items-center p-3 bg-card border-t border-border">
        {track.coverArtUrl && (
          <Image
            source={{ uri: track.coverArtUrl }}
            className="w-10 h-10 rounded"
          />
        )}
        <View className="flex-1 mx-3">
          <Text className="text-foreground font-medium" numberOfLines={1}>
            {track.title}
          </Text>
          <Text className="text-muted-foreground text-xs" numberOfLines={1}>
            {track.artistName}
          </Text>
        </View>
        <TouchableOpacity onPress={togglePlayPause} className="p-2">
          {isLoading ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : isPlaying ? (
            <Pause size={24} color="#8B5CF6" />
          ) : (
            <Play size={24} color="#8B5CF6" />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Full player
  return (
    <View className="bg-card rounded-xl p-4 mx-4 shadow-lg">
      {/* Cover Art */}
      <View className="items-center mb-4">
        {track.coverArtUrl ? (
          <Image
            source={{ uri: track.coverArtUrl }}
            className="w-48 h-48 rounded-lg"
          />
        ) : (
          <View className="w-48 h-48 rounded-lg bg-muted items-center justify-center">
            <Text className="text-muted-foreground">No Cover</Text>
          </View>
        )}
      </View>

      {/* Track Info */}
      <View className="items-center mb-4">
        <Text className="text-foreground text-lg font-bold" numberOfLines={1}>
          {track.title}
        </Text>
        <Text className="text-muted-foreground" numberOfLines={1}>
          {track.artistName}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#8B5CF6"
          maximumTrackTintColor="#374151"
          thumbTintColor="#8B5CF6"
        />
        <View className="flex-row justify-between px-2">
          <Text className="text-muted-foreground text-xs">
            {formatTime(position)}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      {/* Controls */}
      {showControls && (
        <View className="flex-row items-center justify-center space-x-6">
          {onPrevious && (
            <TouchableOpacity onPress={onPrevious} className="p-3">
              <SkipBack size={28} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={togglePlayPause}
            className="w-16 h-16 rounded-full bg-primary items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="white" />
            ) : isPlaying ? (
              <Pause size={32} color="white" />
            ) : (
              <Play size={32} color="white" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>

          {onNext && (
            <TouchableOpacity onPress={onNext} className="p-3">
              <SkipForward size={28} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Volume Control */}
      <TouchableOpacity
        onPress={toggleMute}
        className="absolute top-4 right-4 p-2"
      >
        {isMuted ? (
          <VolumeX size={20} color="#9CA3AF" />
        ) : (
          <Volume2 size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Hook for managing audio playback state globally
export const useAudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playTrack = useCallback((track: Track, tracks?: Track[]) => {
    setCurrentTrack(track);
    if (tracks) {
      setPlaylist(tracks);
      setCurrentIndex(tracks.findIndex(t => t.id === track.id));
    }
  }, []);

  const playNext = useCallback(() => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(playlist[nextIndex]);
    }
  }, [playlist, currentIndex]);

  const playPrevious = useCallback(() => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(playlist[prevIndex]);
    }
  }, [playlist, currentIndex]);

  const clearPlayer = useCallback(() => {
    setCurrentTrack(null);
    setPlaylist([]);
    setCurrentIndex(0);
  }, []);

  return {
    currentTrack,
    playlist,
    currentIndex,
    playTrack,
    playNext,
    playPrevious,
    clearPlayer,
    hasNext: currentIndex < playlist.length - 1,
    hasPrevious: currentIndex > 0,
  };
};

export default AudioPlayer;

import { useState, useEffect } from 'react';
import { Geolocation, Position, PositionOptions } from '@capacitor/geolocation';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useGeolocation = () => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);

  const checkPermissions = async () => {
    if (!isNativeApp()) {
      return new Promise<{ location: 'granted' | 'denied' | 'prompt' }>((resolve) => {
        if (!navigator.geolocation) {
          resolve({ location: 'denied' });
          return;
        }
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          resolve({ location: result.state as 'granted' | 'denied' | 'prompt' });
        }).catch(() => {
          // Fallback if permissions query not supported
          resolve({ location: 'prompt' });
        });
      });
    }
    return await Geolocation.checkPermissions();
  };

  const requestPermissions = async () => {
    if (!isNativeApp()) {
      // Browser will prompt automatically on first use of getCurrentPosition
      return { location: 'granted' as const };
    }
    return await Geolocation.requestPermissions();
  };

  const getCurrentPosition = async (options?: PositionOptions): Promise<Position | null> => {
    if (!isNativeApp()) {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          toast.error('Geolocation is not supported by your browser');
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos: Position = {
              timestamp: position.timestamp,
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
              }
            };
            setCurrentPosition(pos);
            resolve(pos);
          },
          (error) => {
            console.error('Browser geolocation error:', error);
            toast.error('Failed to get location');
            resolve(null);
          },
          {
            enableHighAccuracy: options?.enableHighAccuracy,
            timeout: options?.timeout,
            maximumAge: options?.maximumAge
          }
        );
      });
    }

    try {
      const permissions = await checkPermissions();
      if (permissions.location !== 'granted') {
        const requested = await requestPermissions();
        if (requested.location !== 'granted') {
          toast.error('Location permission denied');
          return null;
        }
      }

      const position = await Geolocation.getCurrentPosition(options);
      setCurrentPosition(position);
      return position;
    } catch (error) {
      console.error('Failed to get current position:', error);
      toast.error('Failed to get location');
      return null;
    }
  };

  const startWatchingPosition = async (
    callback: (position: Position) => void,
    options?: PositionOptions
  ) => {
    if (!isNativeApp()) {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        return;
      }

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const pos: Position = {
            timestamp: position.timestamp,
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            }
          };
          setCurrentPosition(pos);
          callback(pos);
        },
        (error) => {
          console.error('Browser watch position error', error);
          toast.error('Failed to track location');
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy,
          timeout: options?.timeout,
          maximumAge: options?.maximumAge
        }
      );
      setWatchId(id.toString());
      setIsTracking(true);
      return;
    }

    try {
      const permissions = await checkPermissions();
      if (permissions.location !== 'granted') {
        const requested = await requestPermissions();
        if (requested.location !== 'granted') {
          toast.error('Location permission denied');
          return;
        }
      }

      const id = await Geolocation.watchPosition(options || {}, (position, err) => {
        if (err) {
          console.error('Watch position error:', err);
          toast.error('Failed to track location');
          return;
        }
        if (position) {
          setCurrentPosition(position);
          callback(position);
        }
      });

      setWatchId(id);
      setIsTracking(true);
    } catch (error) {
      console.error('Failed to start watching position:', error);
      toast.error('Failed to start tracking location');
    }
  };

  const stopWatchingPosition = async () => {
    if (!watchId) return;

    if (!isNativeApp()) {
      navigator.geolocation.clearWatch(parseInt(watchId));
      setWatchId(null);
      setIsTracking(false);
      return;
    }

    try {
      await Geolocation.clearWatch({ id: watchId });
      setWatchId(null);
      setIsTracking(false);
    } catch (error) {
      console.error('Failed to stop watching position:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        stopWatchingPosition();
      }
    };
  }, [watchId]);

  return {
    currentPosition,
    isTracking,
    checkPermissions,
    requestPermissions,
    getCurrentPosition,
    startWatchingPosition,
    stopWatchingPosition,
  };
};

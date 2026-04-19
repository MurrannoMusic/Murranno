# Enhanced Audio Player with Landscape Mode

The app now includes an enhanced audio player with fullscreen landscape mode, real-time audio visualizations, and native device integration.

## 🎵 Features

### Compact Player Mode
- Play/pause controls
- Progress bar with seek functionality
- Volume controls with mute toggle
- Track title and artist name display
- Album cover art display
- Fullscreen button to enter landscape mode

### Fullscreen Landscape Mode
- **Automatic screen orientation lock** to landscape when entering fullscreen
- **Real-time audio visualization** with animated frequency bars
- **Enhanced control panel** with larger, touch-friendly buttons
- **Skip forward/backward** (10 seconds)
- **Gradient visualizations** synced to audio frequencies
- **Haptic feedback** on all interactions
- **Smooth animations** with fade-in and slide effects

## 🎨 Visual Elements

### Audio Visualization
- Uses Web Audio API for real-time frequency analysis
- 256-point FFT for detailed frequency data
- Gradient bars colored with primary theme colors
- Synchronized with audio playback
- Canvas-based rendering for smooth 60fps animation

### UI/UX Design
- Design system colors (HSL-based semantic tokens)
- Smooth transitions and animations
- Touch-optimized controls in landscape mode
- Monospace time display for precise timing
- Backdrop blur effects for depth

## 📱 Native Integration

### Screen Orientation
- Locks to landscape when entering fullscreen
- Automatically unlocks when exiting
- Uses Capacitor Screen Orientation API
- Works on both iOS and Android

### Haptic Feedback
- Button press feedback for all controls
- Success feedback on track completion
- Error feedback for failures
- Uses Capacitor Haptics API

## 🚀 Usage

### Basic Usage
```tsx
import { EnhancedAudioPlayer } from '@/components/audio/EnhancedAudioPlayer';

<EnhancedAudioPlayer
  audioUrl="https://example.com/audio.mp3"
  trackTitle="Song Title"
  artistName="Artist Name"
  coverArt="https://example.com/cover.jpg"
/>
```

### Demo Page
Visit `/app/audio-demo` to see the enhanced audio player in action with sample tracks.

## 🎯 Components

### EnhancedAudioPlayer
**Location:** `src/components/audio/EnhancedAudioPlayer.tsx`

Full-featured audio player with:
- Compact and fullscreen modes
- Audio visualization
- Screen orientation control
- Haptic feedback integration

**Props:**
- `audioUrl` (required): URL of the audio file
- `trackTitle` (optional): Title of the track
- `artistName` (optional): Name of the artist
- `coverArt` (optional): URL of the album cover image
- `className` (optional): Additional CSS classes

### AudioPreviewPlayer (Updated)
**Location:** `src/components/admin/AudioPreviewPlayer.tsx`

Simplified preview player for admin content review:
- Compact design
- Haptic feedback support
- Optional fullscreen callback
- Track info display

## 🔧 Technical Details

### Audio Visualization Implementation
1. Creates Web Audio API context
2. Connects audio element to analyzer
3. Uses 256-bin FFT for frequency analysis
4. Renders frequency data as gradient bars on canvas
5. Runs at ~60fps via `requestAnimationFrame`

### Color System
All colors use semantic tokens:
- `--primary`: Main accent color for active elements
- `--primary-glow`: Lighter variant for gradients
- `--background`: Canvas and backdrop colors
- `--foreground`: Text and icon colors
- `--muted-foreground`: Secondary text

### Performance
- Canvas rendering for smooth animations
- Cleanup of animation frames on unmount
- Efficient frequency data processing
- Optimized for mobile devices

## 📦 Dependencies

Required Capacitor plugins:
- `@capacitor/screen-orientation` - Screen lock functionality
- `@capacitor/haptics` - Haptic feedback

Integrated hooks:
- `useScreenOrientation` - Control device orientation
- `useHaptics` - Trigger haptic feedback

## 🎬 Animations

Uses Tailwind animation utilities:
- `animate-fade-in` - Smooth fade in on fullscreen entry
- `animate-slide-in-right` - Track info slides in
- `hover-scale` - Play button scales on hover
- Custom gradient animations for visualizer

## 🌟 Best Practices

1. **Always provide track metadata** (title, artist) for better UX
2. **Use cover art** for visual appeal in compact mode
3. **Test orientation lock** on physical devices
4. **Ensure audio URLs** are HTTPS for web audio API
5. **Handle loading states** for better perceived performance

## 🔮 Future Enhancements

Potential features to add:
- Playlist support with next/previous track
- Repeat and shuffle modes
- Equalizer controls
- Audio effects (reverb, bass boost)
- Lyrics display
- Share currently playing track
- Background audio playback
- Lock screen controls
- Audio caching for offline playback

## 📝 Notes

- Fullscreen mode works best on mobile devices
- Web Audio API requires user interaction to start
- Visualization performance may vary by device
- Screen orientation lock only works in native apps
- Haptic feedback only works on supported devices

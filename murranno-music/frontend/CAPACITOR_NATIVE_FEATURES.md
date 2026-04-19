# Capacitor Native Features Implementation Guide

This document outlines all the Capacitor native features that have been integrated into the Murranno Music app.

## ✅ Implemented Features

### Phase 1: Core Integrations (Existing Hooks)

#### 1. **Share Functionality** (`useShare`)
- **Location**: `src/hooks/useShare.ts`
- **Used in**:
  - Release Detail page - Share smartlinks
  - Artist Profile page - Share artist profiles
- **Features**:
  - Native share on mobile (iOS/Android share sheet)
  - Fallback to Web Share API on web
  - Fallback to clipboard copy if share not available
  - Specialized functions: `shareTrack()`, `shareArtist()`, `shareUrl()`, `shareText()`

#### 2. **Device Information** (`useDevice`)
- **Location**: `src/hooks/useDevice.ts`
- **Used in**:
  - Dashboard - Device analytics logging
- **Features**:
  - Get device model, platform, OS version
  - Get unique device ID
  - Get battery information
  - Get language code
  - Automatic device info collection for analytics

#### 3. **App Lifecycle** (`useAppLifecycle`)
- **Location**: `src/hooks/useAppLifecycle.ts`
- **Used in**:
  - EnhancedAudioPlayer - Auto-pause when app goes to background
- **Features**:
  - Track app state (active/background)
  - Handle back button on Android
  - App exit and minimize functions
  - Get app info (version, build)

#### 4. **Filesystem Operations** (`useFilesystem`)
- **Location**: `src/hooks/useFilesystem.ts`
- **Used in**:
  - EnhancedAudioPlayer - Cache audio files for offline playback
- **Features**:
  - Cache audio files locally
  - Check if files are cached
  - Clear audio cache
  - Save files to device storage

#### 5. **Geolocation** (`useGeolocation`)
- **Location**: `src/hooks/useGeolocation.ts`
- **Used in**:
  - Dashboard - Location-based analytics
- **Features**:
  - Get current location
  - Watch position (continuous tracking)
  - Permission handling
  - Location analytics logging

### Phase 2: Advanced Native Features

#### 6. **Native Audio Playback** (`useNativeAudio`)
- **Location**: `src/hooks/useNativeAudio.ts`, `src/components/audio/NativeAudioPlayer.tsx`
- **Used in**:
  - AudioDemo page
- **Features**:
  - Background audio playback
  - Lock screen controls support
  - Audio preloading and caching
  - Volume control
  - Seek functionality
  - Get duration and current time
  - Loop support
  - Optimized for battery and performance

#### 7. **Clipboard Operations** (`useClipboard`)
- **Location**: `src/hooks/useClipboard.ts`
- **Used in**:
  - Campaign Payment Success - Copy payment references
  - Payout Method Cards - Copy account numbers
  - Release Detail - Copy smartlinks
- **Features**:
  - Copy text to clipboard
  - Read from clipboard
  - Specialized functions: `copyTrackLink()`, `copyPromoCode()`, `copyPaymentReference()`, `copySmartlink()`, `copyAccountNumber()`
  - Success toast notifications

### Phase 3: Security & Updates

#### 8. **Biometric Authentication** (`useBiometricAuth`)
- **Location**: `src/hooks/useBiometricAuth.ts`
- **Used in**:
  - Login page - Biometric login option
  - Settings page - Enable/disable biometric login
- **Features**:
  - Face ID support (iOS)
  - Touch ID support (iOS)
  - Fingerprint support (Android)
  - Face authentication (Android)
  - Iris authentication (Android)
  - Availability checking
  - Error handling for all biometric error types
  - Save email for quick biometric login

#### 9. **App Updates** (`useAppUpdate`)
- **Location**: `src/hooks/useAppUpdate.ts`, `src/components/app/AppUpdateBanner.tsx`
- **Used in**:
  - App.tsx - Global update banner
  - Settings page - Manual update checking
- **Features**:
  - Auto-check for updates on app launch
  - Update availability detection
  - Version comparison (current vs available)
  - Immediate update flow
  - Flexible update (background download)
  - Open app store for updates
  - Update banner with dismiss option

### Existing Native Features (Already Implemented)

#### 10. **Camera** (`useCamera`)
- Profile image uploads
- QR code scanning (potential use)

#### 11. **Browser** (`useBrowser`)
- Open external links
- In-app browser for web content

#### 12. **Push Notifications** (`usePushNotifications`)
- Campaign status updates
- Earnings alerts
- Release status changes
- Badge count management

#### 13. **Network Status** (`useNetwork`)
- Online/offline detection
- Connection type monitoring
- Network status alerts

#### 14. **Status Bar** (`useStatusBar`)
- Theme-based styling
- Background color control
- Show/hide functionality
- Overlay control

#### 15. **Keyboard** (`useKeyboard`)
- Keyboard show/hide detection
- Height tracking
- Input field management

#### 16. **Screen Orientation** (`useScreenOrientation`)
- Landscape mode for audio player
- Orientation locking
- Orientation detection

#### 17. **Local Notifications** (`useLocalNotifications`)
- Scheduled reminders
- Campaign reminders
- Custom notifications

#### 18. **Haptics** (`useHaptics`)
- Button press feedback
- Success/error vibrations
- Impact feedback
- Throughout UI interactions

#### 19. **Badge Notifications** (`useBadgeCount`)
- Unread notification count
- App icon badge updates
- Badge settings in Settings page

## 📱 Usage Examples

### Share a Track
```typescript
const { shareTrack } = useShare();
await shareTrack('Track Title', 'Artist Name', 'https://track-url.com');
```

### Copy to Clipboard
```typescript
const { copySmartlink } = useClipboard();
await copySmartlink('https://smartlink-url.com');
```

### Biometric Authentication
```typescript
const { authenticate } = useBiometricAuth();
const success = await authenticate({
  reason: 'Authenticate to continue',
  androidTitle: 'Biometric Login'
});
```

### Check for Updates
```typescript
const { checkForUpdate, updateAvailable } = useAppUpdate();
const hasUpdate = await checkForUpdate();
if (hasUpdate) {
  // Show update prompt
}
```

### Native Audio Playback
```typescript
const { preloadAudio, play, pause } = useNativeAudio();
await preloadAudio('track-1', 'https://audio-url.mp3');
await play('track-1');
```

## 🔧 Setup & Testing

### Prerequisites
- Xcode (for iOS development)
- Android Studio (for Android development)
- Physical device or emulator

### Build & Sync
```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with native platforms
npx cap sync

# Run on device
npx cap run ios
# OR
npx cap run android
```

### Testing Native Features
1. Build the app using the commands above
2. Run on a physical device (recommended for full feature testing)
3. Test each feature:
   - Share: Try sharing a track or artist profile
   - Clipboard: Copy smartlinks, payment refs, account numbers
   - Biometric: Enable in settings, logout, login with biometrics
   - Audio: Play tracks in AudioDemo page, test background playback
   - Updates: Check for updates in Settings
   - Location: View console logs on Dashboard
   - Device Info: View console logs on Dashboard

## 🚨 Important Notes

### Platform-Specific Considerations

**iOS:**
- Biometric authentication requires Face ID/Touch ID setup on device
- Background audio requires Audio capability enabled in Xcode
- Push notifications require APNs certificate
- Location requires location permissions in Info.plist

**Android:**
- Biometric requires device to have biometric hardware
- Background audio requires foreground service
- Push notifications require FCM setup
- Location requires location permissions in AndroidManifest.xml

### Permissions
All features requiring permissions handle permission requests automatically:
- Camera: Requested on first use
- Location: Requested on first use
- Biometric: Uses device-level settings
- Notifications: Requested on first app launch

### Fallbacks
All native features have web fallbacks:
- Share → Web Share API → Clipboard
- Biometric → Standard login
- Native Audio → HTML5 Audio
- All native-only features gracefully degrade on web

## 📚 Related Documentation
- [Capacitor Setup Guide](./CAPACITOR_SETUP.md)
- [Audio Player Features](./AUDIO_PLAYER_FEATURES.md)
- [Push Notifications Setup](./PUSH_NOTIFICATIONS_SETUP.md)
- [Badge Notifications Setup](./BADGE_NOTIFICATIONS_SETUP.md)

# Capacitor Native App Setup Guide

This project is configured as a native mobile app using Capacitor. All plugins have been installed and hooks created for easy integration.

## 🚀 Quick Start

### Prerequisites
- **For iOS**: Mac with Xcode installed
- **For Android**: Android Studio installed
- Node.js and npm installed

### Initial Setup

1. **Export to GitHub**
   - Click "Export to Github" button in Lovable
   - Clone the repository to your local machine
   ```bash
   git clone <your-repo-url>
   cd murranno-music
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add Native Platforms**
   ```bash
   # For iOS (Mac only)
   npx cap add ios
   
   # For Android
   npx cap add android
   ```

4. **Update Platform Dependencies**
   ```bash
   # For iOS
   npx cap update ios
   
   # For Android
   npx cap update android
   ```

5. **Build the Web App**
   ```bash
   npm run build
   ```

6. **Sync with Native Platforms**
   ```bash
   npx cap sync
   ```

7. **Run on Device/Emulator**
   ```bash
   # For iOS (opens Xcode)
   npx cap run ios
   
   # For Android (opens Android Studio)
   npx cap run android
   ```

## 📱 Installed Plugins & Hooks

### Core Features (Phase 1)
- ✅ **Camera** (`useCamera`) - Take photos, pick from gallery
- ✅ **Filesystem** (`useFilesystem`) - Cache audio files, save files
- ✅ **Push Notifications** (`usePushNotifications`) - Handle push notifications
- ✅ **Share** (`useShare`) - Share content to other apps

### Enhanced UX (Phase 2)
- ✅ **Status Bar** (`useStatusBar`, `useAutoStatusBar`) - Control status bar appearance
- ✅ **Local Notifications** (`useLocalNotifications`) - Schedule local notifications
- ✅ **Haptics** (`useHaptics`) - Provide haptic feedback
- ✅ **Browser** (`useBrowser`) - Open URLs in in-app browser

### System Integration (Phase 3)
- ✅ **App** (`useAppLifecycle`) - Handle app state changes, back button
- ✅ **Network** (`useNetwork`) - Monitor connection status
- ✅ **Device** (`useDevice`) - Get device information
- ✅ **Keyboard** (`useKeyboard`) - Control and monitor keyboard

### Advanced Features (Phase 4)
- ✅ **Geolocation** (`useGeolocation`) - Get device location, track movement
- ✅ **Screen Orientation** (`useScreenOrientation`) - Lock/unlock orientation

## 🔧 Hot Reload Development

The app is configured with hot reload enabled via the server URL in `capacitor.config.ts`. This means you can:
- Make changes in Lovable
- See updates instantly on your physical device/emulator
- No need to rebuild for each change

**Note**: After making changes that affect native code or adding new plugins:
1. Git pull the latest changes
2. Run `npx cap sync`

## 📖 Using the Hooks

### Example: Camera
```tsx
import { useCamera } from '@/hooks/useCamera';

function MyComponent() {
  const { takePhoto, pickFromGallery, isCapturing } = useCamera();
  
  const handleTakePhoto = async () => {
    const file = await takePhoto();
    if (file) {
      // Use the file
    }
  };
  
  return <button onClick={handleTakePhoto}>Take Photo</button>;
}
```

### Example: Haptics
```tsx
import { useHaptics } from '@/hooks/useHaptics';

function MyButton() {
  const { buttonPress, success } = useHaptics();
  
  const handleClick = () => {
    buttonPress();
    // Do something
    success();
  };
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

### Example: Geolocation
```tsx
import { useGeolocation } from '@/hooks/useGeolocation';

function LocationComponent() {
  const { getCurrentPosition, currentPosition } = useGeolocation();
  
  const getLocation = async () => {
    const position = await getCurrentPosition();
    console.log('Lat:', position?.coords.latitude);
    console.log('Lng:', position?.coords.longitude);
  };
  
  return <button onClick={getLocation}>Get Location</button>;
}
```

### Example: Screen Orientation
```tsx
import { useScreenOrientation } from '@/hooks/useScreenOrientation';
import { OrientationLockType } from '@capacitor/screen-orientation';

function VideoPlayer() {
  const { lock, unlock, isLandscape } = useScreenOrientation();
  
  const handleFullscreen = () => {
    lock(OrientationLockType.LANDSCAPE);
  };
  
  const handleExitFullscreen = () => {
    unlock();
  };
  
  return (
    <div>
      <video />
      {isLandscape && <button onClick={handleExitFullscreen}>Exit</button>}
    </div>
  );
}
```

## 🔐 Permissions

Some plugins require permissions. The hooks handle permission requests automatically:
- **Camera**: Requests camera/photo library access
- **Push Notifications**: Requests notification permissions
- **Geolocation**: Requests location permissions
- **Local Notifications**: Requests notification permissions

## 📱 Platform-Specific Notes

### iOS
- Requires Mac with Xcode
- First build may take longer
- Sign with Apple Developer account for physical devices

### Android
- Requires Android Studio
- Can test on emulators or physical devices
- USB debugging must be enabled on physical devices

## 🐛 Troubleshooting

### Changes not reflecting on device?
```bash
npm run build
npx cap sync
```

### Plugin errors?
```bash
npx cap update ios
# or
npx cap update android
```

### Build issues?
- Clean build folders
- Update Capacitor CLI: `npm install @capacitor/cli@latest`
- Check native project in Xcode/Android Studio

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [iOS Setup Guide](https://capacitorjs.com/docs/ios)
- [Android Setup Guide](https://capacitorjs.com/docs/android)

## 🎯 Next Steps

Now that all plugins are installed, you can:
1. Test the app on a physical device
2. Customize the native app icons and splash screens
3. Configure app permissions in native projects
4. Prepare for app store deployment
5. Test all native features thoroughly

For deployment to App Store/Play Store, refer to Capacitor's deployment guides.

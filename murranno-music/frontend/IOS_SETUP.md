# iOS Setup Guide for Murranno Music

This guide covers all the necessary iOS configurations for the Capacitor plugins used in this project.

## Prerequisites

- macOS with Xcode 15 or higher
- iOS 13.0 or higher target
- Valid Apple Developer account (for device testing and distribution)
- CocoaPods installed

## Initial Setup

1. **Export and Clone Project**
   ```bash
   # Export project to GitHub, then clone locally
   git clone <your-repo-url>
   cd murranno-music
   npm install
   ```

2. **Add iOS Platform**
   ```bash
   npx cap add ios
   ```

3. **Build Web Assets**
   ```bash
   npm run build
   ```

4. **Install CocoaPods Dependencies**
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

5. **Sync with Native Project**
   ```bash
   npx cap sync ios
   ```

## Info.plist Configuration

Location: `ios/App/App/Info.plist`

Add the following keys inside the `<dict>` tag:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Name -->
    <key>CFBundleDisplayName</key>
    <string>Murranno Music</string>
    
    <!-- Camera Permission -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs access to your camera to take photos for your profile and album art.</string>
    
    <!-- Photo Library Permission -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs access to your photo library to select images for your profile and album art.</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>This app needs permission to save photos to your library.</string>
    
    <!-- Location Permission -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>This app needs your location to show nearby events and concerts.</string>
    <key>NSLocationAlwaysUsageDescription</key>
    <string>This app needs your location to provide location-based features.</string>
    
    <!-- Microphone Permission (if needed for audio recording) -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs access to your microphone to record audio.</string>
    
    <!-- Face ID / Touch ID Permission -->
    <key>NSFaceIDUsageDescription</key>
    <string>This app uses Face ID for secure and convenient authentication.</string>
    
    <!-- Background Modes for Audio -->
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
        <string>remote-notification</string>
    </array>
    
    <!-- Allow HTTP connections (for development only) -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    
    <!-- Custom URL Scheme for Deep Linking (OAuth) -->
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>CFBundleURLName</key>
            <string>app.lovable.c3daad8632214cd78f32217f9f05ec3c</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>murranno</string>
            </array>
        </dict>
    </array>
    
    <!-- Push Notifications Capability -->
    <key>UIUserInterfaceStyle</key>
    <string>Automatic</string>
</dict>
</plist>
```

## Xcode Project Configuration

### 1. Open in Xcode
```bash
npx cap open ios
```

### 2. Configure Signing & Capabilities

In Xcode:
1. Select the `App` target
2. Go to **Signing & Capabilities** tab
3. Select your development team
4. Ensure Bundle Identifier matches: `app.lovable.c3daad8632214cd78f32217f9f05ec3c`

### 3. Add Required Capabilities

Click **+ Capability** and add:

- **Push Notifications**
- **Background Modes** (check Audio, Remote notifications)
- **Associated Domains** (optional, for Universal Links):
  - Add: `applinks:c3daad86-3221-4cd7-8f32-217f9f05ec3c.lovableproject.com`

## Deep Linking Setup for OAuth

The app is configured to handle OAuth callbacks via the custom URL scheme `murranno://`.

### Backend Configuration Required

**CRITICAL**: You must configure the correct redirect URLs in Lovable Cloud for OAuth to work in the native app.

Add the following redirect URLs to your Lovable Cloud auth settings:
```
https://c3daad86-3221-4cd7-8f32-217f9f05ec3c.lovableproject.com/auth/callback
https://murranno-music.lovable.app/auth/callback
```

To configure this:
1. Open Lovable Cloud Dashboard
2. Go to **Users → Auth Settings**
3. Under **Redirect URLs**, add both URLs above
4. Also ensure your **Site URL** is set to your production URL

### How OAuth Flow Works

1. User clicks "Sign in with Google/Apple" in native app
2. App opens in-app browser with OAuth provider
3. User completes authentication with Google/Apple
4. OAuth provider redirects to: `https://[your-domain]/auth/callback?platform=native`
5. The web callback page detects `platform=native` parameter
6. Callback page immediately redirects to: `murranno://callback#access_token=xxx&refresh_token=xxx`
7. iOS opens your native app via the custom URL scheme
8. Deep link handler in `useDeepLink.ts` extracts tokens
9. Tokens are used to establish Supabase session in native app
10. User is redirected to dashboard

### Common OAuth Issues

**Problem: "Lovable Auth Bridge" appears instead of app opening**
- **Cause**: Redirect URLs not configured in Lovable Cloud
- **Solution**: Add both preview and production URLs to redirect URLs in Lovable Cloud auth settings

**Problem: OAuth completes but app doesn't open**
- **Cause**: Custom URL scheme not configured in Info.plist or not registered
- **Solution**: Verify `murranno` scheme is in CFBundleURLSchemes in Info.plist

**Problem: App opens but authentication fails**
- **Cause**: Tokens not being passed correctly or session not established
- **Solution**: Check console logs for errors in token parsing or session creation

### Testing Deep Links

To test deep linking on iOS Simulator:
```bash
xcrun simctl openurl booted murranno://callback?access_token=test&refresh_token=test
```

On a physical device, you can create a test webpage with a link:
```html
<a href="murranno://callback?access_token=test&refresh_token=test">Test OAuth</a>
```

## Firebase Setup for Push Notifications

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Add an iOS app with Bundle ID: `app.lovable.c3daad8632214cd78f32217f9f05ec3c`

2. **Download GoogleService-Info.plist**
   - Download the `GoogleService-Info.plist` file from Firebase Console
   - In Xcode, drag and drop it into the `App` folder
   - Make sure "Copy items if needed" is checked

3. **Configure APNs (Apple Push Notification Service)**
   - In Firebase Console, go to Project Settings → Cloud Messaging → iOS
   - Upload your APNs Authentication Key or APNs Certificate
   - Get the key from Apple Developer Portal → Certificates, IDs & Profiles → Keys

4. **Add Firebase to Podfile** (already configured in Capacitor)

The CocoaPods will automatically install Firebase dependencies when you run `pod install`.

## Build Settings

### Minimum Deployment Target
Ensure minimum iOS version is set to **13.0** in:
- Xcode: App Target → General → Deployment Info → iOS
- Podfile: `platform :ios, '13.0'`

### Swift Version
Ensure Swift version is **5.0** or higher in Build Settings.

## Testing on Physical Device

1. **Connect Device**: Connect your iPhone/iPad via USB
2. **Trust Computer**: On device, trust the computer
3. **Select Device**: In Xcode, select your device from the device dropdown
4. **Build and Run**: Press ⌘R or click the Play button

### Common Issues

**"Developer Mode Required" (iOS 16+)**
- On device: Settings → Privacy & Security → Developer Mode → Enable
- Restart device

**"Untrusted Developer"**
- On device: Settings → General → VPN & Device Management
- Trust your developer certificate

## Hot Reload Development

For hot reload during development:

1. Make sure `capacitor.config.ts` has the server URL configured:
   ```typescript
   server: {
     url: "https://c3daad86-3221-4cd7-8f32-217f9f05ec3c.lovableproject.com?forceHideBadge=true",
     cleartext: true
   }
   ```

2. Run the app on device/simulator
3. Make changes in Lovable - they'll reflect instantly

**Note**: Make sure your iOS device is on the same network as your development machine.

## Troubleshooting

### Build Errors

**"Pod install failed"**
```bash
cd ios/App
pod deintegrate
pod cache clean --all
pod install
cd ../..
```

**"No such module 'Capacitor'"**
- Clean build folder: Xcode → Product → Clean Build Folder (⇧⌘K)
- Run `npx cap sync ios`

**"Code signing error"**
- Make sure you have a valid Apple Developer account
- Check that Bundle Identifier is correctly set
- Verify signing certificate is valid

### Permission Issues

**Camera/Photo Library not working**
- Check Info.plist has usage descriptions
- Grant permissions in iOS Settings → Privacy

**Location not working**
- Enable Location Services on device
- Grant permissions in app
- Check Info.plist usage descriptions

**Push notifications not received**
- Verify `GoogleService-Info.plist` is added to project
- Check APNs certificate/key is configured in Firebase
- Test on physical device (push notifications don't work on simulator)

### Deep Link Issues

**OAuth callback not opening app**
- Verify URL scheme is correctly configured in Info.plist (`murranno` in CFBundleURLSchemes)
- **CRITICAL**: Add HTTPS redirect URLs to Lovable Cloud (not `murranno://callback`)
  - Add: `https://c3daad86-3221-4cd7-8f32-217f9f05ec3c.lovableproject.com/auth/callback`
  - Add: `https://murranno-music.lovable.app/auth/callback`
- Test with: `xcrun simctl openurl booted murranno://callback#access_token=test&refresh_token=test`

**"Lovable Auth Bridge" appears**
- This means redirect URLs are not configured in Lovable Cloud
- Go to Lovable Cloud → Users → Auth Settings → Redirect URLs
- Add both preview and production URLs (see above)

**App opens but OAuth doesn't complete**
- Check browser console and native app logs for errors
- Verify tokens are in URL hash fragment (not query params): `#access_token=xxx&refresh_token=xxx`
- Ensure `useDeepLink` hook is initialized in App component
- Check that `Browser.close()` is being called after tokens are received

**Session not persisting after OAuth**
- Verify `supabase.auth.setSession()` is being called with both tokens
- Check that session and user state are being updated in AuthContext
- Ensure auth state listener is set up correctly

## Production Build

For App Store distribution:

1. **Archive the App**
   - In Xcode: Product → Archive
   - Wait for build to complete

2. **Distribute to App Store**
   - In Organizer: Select archive → Distribute App
   - Choose "App Store Connect"
   - Follow the prompts

3. **App Store Configuration**
   - Create app in [App Store Connect](https://appstoreconnect.apple.com)
   - Fill in app metadata, screenshots, description
   - Submit for review

### Required Screenshots Sizes
- 6.7" (iPhone 15 Pro Max): 1290 x 2796
- 6.5" (iPhone 11 Pro Max): 1242 x 2688
- 5.5" (iPhone 8 Plus): 1242 x 2208

## Privacy Manifest

iOS 17+ requires privacy manifests for certain APIs. Create `PrivacyInfo.xcprivacy` in the App folder:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
```

## Next Steps

- Test all native features on a physical device
- Set up TestFlight for beta testing
- Configure App Store Connect
- Submit for App Store review

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Firebase Cloud Messaging for iOS](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

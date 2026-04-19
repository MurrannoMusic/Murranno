# Splash Screen & App Icon Configuration Guide

Complete guide for configuring splash screens and app icons for the Murranno Music native app.

## 📐 Asset Requirements Overview

```
assets/
├── icon.png                    # 1024x1024 - Main app icon
├── adaptive-icon.png           # 1024x1024 - Android adaptive icon foreground
├── splash.png                  # 2732x2732 - Universal splash image
├── notification-icon.png       # 96x96 - Android notification (white on transparent)
└── favicon.png                 # 48x48 - Web favicon (if using Expo web)
```

---

## 🍎 iOS App Icons

### Required Sizes

iOS requires multiple icon sizes. Expo handles this automatically from your 1024x1024 source.

| Size | Usage |
|------|-------|
| 20x20 | Notification (iPad) |
| 29x29 | Settings |
| 40x40 | Spotlight, Notification (iPhone) |
| 60x60 | Home Screen (iPhone) |
| 76x76 | Home Screen (iPad) |
| 83.5x83.5 | Home Screen (iPad Pro) |
| 1024x1024 | App Store |

### iOS Icon Guidelines

1. **No transparency** - iOS icons must have solid backgrounds
2. **No rounded corners** - iOS applies rounding automatically
3. **Safe zone** - Keep important content within center 80%
4. **Single icon file** - Provide `icon.png` at 1024x1024, Expo generates all sizes

```json
// app.json
{
  "expo": {
    "icon": "./assets/icon.png"
  }
}
```

---

## 🤖 Android App Icons

### Adaptive Icons (Android 8.0+)

Android adaptive icons have two layers:
- **Foreground** - Your logo/icon (432x432 visible area within 1024x1024)
- **Background** - Solid color or image

```
┌─────────────────────────────────┐
│                                 │
│    ┌───────────────────────┐    │
│    │                       │    │
│    │    SAFE ZONE (66%)    │    │
│    │    432x432 pixels     │    │
│    │                       │    │
│    └───────────────────────┘    │
│                                 │
│         FULL CANVAS             │
│         1024x1024               │
└─────────────────────────────────┘
```

### Foreground Guidelines

- Total canvas: 1024x1024
- Safe zone: 432x432 (center 66%)
- Keep logo/text within safe zone
- Background should be transparent

### Configuration

```json
// app.json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1A1F2E"
      }
    }
  }
}
```

### Notification Icon (Android)

- Size: 96x96 pixels
- Must be **white on transparent**
- No colors (Android tints it)

```json
// app.json
{
  "expo": {
    "android": {
      "icon": "./assets/notification-icon.png"
    },
    "notification": {
      "icon": "./assets/notification-icon.png"
    }
  }
}
```

---

## 🚀 Splash Screen Configuration

### Static Splash Screen

The static splash shows during native app boot before JS loads.

#### Image Requirements

| Platform | Recommended Size | Notes |
|----------|------------------|-------|
| Universal | 2732x2732 | Largest iPad Pro size |
| Safe zone | Center 1242x2208 | Keep text/logo here |

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│      ┌───────────────────────┐      │
│      │                       │      │
│      │    SAFE ZONE          │      │
│      │    Logo/Text here     │      │
│      │                       │      │
│      └───────────────────────┘      │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### Basic Configuration

```json
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1F2E"
    }
  }
}
```

### Advanced Configuration

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Murranno Music',
  slug: 'murranno-music',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1A1F2E',
  },
  
  ios: {
    bundleIdentifier: 'com.murranno.music',
    supportsTablet: true,
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1F2E',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F1318',
      },
    },
  },
  
  android: {
    package: 'com.murranno.music',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1A1F2E',
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1F2E',
      dark: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#0F1318',
      },
    },
  },
  
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1A1F2E',
        image: './assets/splash.png',
        dark: {
          image: './assets/splash.png',
          backgroundColor: '#0F1318',
        },
        imageWidth: 200,
      },
    ],
  ],
});
```

### Programmatic Splash Control

```typescript
// App.tsx
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

// Prevent auto-hide
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts, make API calls, etc.
        await loadFonts();
        await fetchInitialData();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Hide splash with fade animation
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {/* Your app content */}
    </View>
  );
}
```

---

## 🎨 Design Specifications

### Murranno Music Brand Colors

```
Primary Background: #1A1F2E (dark navy)
Secondary Background: #0F1318 (darker)
Accent Color: #6366F1 (indigo)
Text Color: #FFFFFF (white)
```

### Recommended Splash Design

```
┌─────────────────────────────────┐
│                                 │
│         MURRANNO                │
│          MUSIC                  │
│                                 │
│           [Logo]                │
│                                 │
│                                 │
│     ────────────────────        │
│     (Optional loading bar)      │
│                                 │
└─────────────────────────────────┘

Background: Solid #1A1F2E or gradient
Logo: Centered, max 40% screen width
```

---

## 🛠️ Asset Generation Tools

### Recommended Tools

1. **Figma** - Design original assets
   - [Expo App Icon Template](https://www.figma.com/community/file/1155362909441341285)
   
2. **Expo Asset Generator** - Generate all sizes
   ```bash
   npx expo-app-icon generate
   ```

3. **App Icon Generator** - Online tool
   - [appicon.co](https://appicon.co)
   - Upload 1024x1024, download all sizes

4. **Android Asset Studio**
   - [romannurik.github.io/AndroidAssetStudio](https://romannurik.github.io/AndroidAssetStudio)

### Figma Export Settings

| Asset | Export Settings |
|-------|----------------|
| icon.png | PNG, 1024x1024, 1x |
| adaptive-icon.png | PNG, 1024x1024, 1x, transparent |
| splash.png | PNG, 2732x2732, 1x |
| notification-icon.png | PNG, 96x96, 1x, white only |

---

## ✅ Pre-Flight Checklist

### Icons
- [ ] `icon.png` is exactly 1024x1024
- [ ] `icon.png` has no transparency (solid background)
- [ ] `adaptive-icon.png` has transparent background
- [ ] Important content within center 66% of adaptive icon
- [ ] `notification-icon.png` is white on transparent

### Splash Screen
- [ ] `splash.png` is at least 2732x2732
- [ ] Logo/text within center safe zone
- [ ] Background color matches `backgroundColor` in config
- [ ] Dark mode variant prepared (optional)

### Configuration
- [ ] `app.json` or `app.config.ts` updated
- [ ] `expo-splash-screen` plugin configured
- [ ] Bundle identifiers set correctly

---

## 🔧 Troubleshooting

### Icon Not Updating
```bash
# Clear cache and rebuild
npx expo prebuild --clean
npx expo run:ios # or run:android
```

### Splash Screen Flashing
```typescript
// Ensure you call preventAutoHideAsync BEFORE rendering
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

// Then hide after app is ready
await SplashScreen.hideAsync();
```

### Android Adaptive Icon Clipping
- Ensure foreground content is within 66% safe zone
- Test with different launcher shapes (circle, square, squircle)

### iOS Splash Not Filling Screen
- Use `resizeMode: 'cover'` for full-bleed images
- Or `resizeMode: 'contain'` with matching backgroundColor

---

## 📱 Testing

### iOS Simulator
```bash
npx expo run:ios
# Check Settings > [App Name] for icon
```

### Android Emulator
```bash
npx expo run:android
# Long-press app icon to see adaptive icon shapes
```

### Physical Devices
1. Build with EAS: `eas build --profile preview`
2. Install on device
3. Verify icons in app drawer/home screen
4. Check notification icon in notification shade

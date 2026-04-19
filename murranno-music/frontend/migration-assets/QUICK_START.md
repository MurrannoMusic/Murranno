# Quick Start Guide - Murranno Music React Native App

This guide walks you through setting up the React Native development environment and running the app on your device.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | 18.x or later | [nodejs.org](https://nodejs.org) |
| npm or yarn | Latest | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Expo CLI | Latest | `npm install -g expo-cli` |
| EAS CLI | Latest | `npm install -g eas-cli` |

### For iOS Development (Mac only)

| Software | Version | Installation |
|----------|---------|--------------|
| Xcode | 14.0+ | Mac App Store |
| Xcode CLI Tools | Latest | `xcode-select --install` |
| CocoaPods | Latest | `sudo gem install cocoapods` |

### For Android Development

| Software | Version | Installation |
|----------|---------|--------------|
| Android Studio | Latest | [developer.android.com](https://developer.android.com/studio) |
| Java JDK | 11 or 17 | Via Android Studio or [adoptium.net](https://adoptium.net) |

---

## Step 1: Create New Expo Project

```bash
# Create a new Expo project with TypeScript template
npx create-expo-app@latest MurrannoMusic --template blank-typescript

# Navigate to project directory
cd MurrannoMusic
```

---

## Step 2: Copy Migration Assets

Copy all files from `migration-assets/` to your new project:

```bash
# From the web project root, copy migration assets
cp -r migration-assets/* /path/to/MurrannoMusic/

# Or manually copy these folders/files:
# - components/     → src/components/
# - hooks/          → src/hooks/
# - navigation/     → src/navigation/
# - screens/        → src/screens/
# - theme/          → src/theme/
# - supabase-client.ts → src/services/supabase.ts
```

### Project Structure After Copy

```
MurrannoMusic/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── modern/
│   │   └── ui/
│   ├── contexts/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   │   └── supabase.ts
│   └── theme/
├── app.config.ts
├── App.tsx
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── global.css
└── package.json
```

---

## Step 3: Install Dependencies

### Core Dependencies

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Supabase
npm install @supabase/supabase-js @react-native-async-storage/async-storage

# State Management & Forms
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod

# UI & Styling
npm install nativewind tailwindcss
npm install react-native-reanimated react-native-gesture-handler

# Date Handling
npm install date-fns
```

### Expo Native Modules

```bash
# Core modules
npx expo install expo-secure-store expo-constants expo-device

# Notifications
npx expo install expo-notifications expo-local-authentication

# Media
npx expo install expo-camera expo-image-picker expo-av

# Location & Sensors
npx expo install expo-location expo-haptics expo-sensors

# Storage & Sharing
npx expo install expo-file-system expo-sharing expo-clipboard

# Navigation & Linking
npx expo install expo-linking expo-router

# Updates
npx expo install expo-updates expo-splash-screen

# Status Bar
npx expo install expo-status-bar
```

### All-in-One Install Command

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @supabase/supabase-js @react-native-async-storage/async-storage @tanstack/react-query react-hook-form @hookform/resolvers zod nativewind tailwindcss react-native-reanimated react-native-gesture-handler date-fns lucide-react-native react-native-svg && npx expo install expo-secure-store expo-constants expo-device expo-notifications expo-local-authentication expo-camera expo-image-picker expo-av expo-location expo-haptics expo-sensors expo-file-system expo-sharing expo-clipboard expo-linking expo-router expo-updates expo-splash-screen expo-status-bar
```

---

## Step 4: Configure Project Files

### 4.1 Update babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

### 4.2 Update metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### 4.3 Create/Update tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        foreground: '#FFFFFF',
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#0A0A0F',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#2D2D44',
          foreground: '#A0A0B0',
        },
        accent: {
          DEFAULT: '#FFD700',
          foreground: '#0A0A0F',
        },
        destructive: {
          DEFAULT: '#FF4757',
          foreground: '#FFFFFF',
        },
        border: '#2D2D44',
        card: {
          DEFAULT: '#1A1A2E',
          foreground: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
```

### 4.4 Create global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.5 Create nativewind.d.ts

```typescript
/// <reference types="nativewind/types" />
```

### 4.6 Update App.tsx

```typescript
import './global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Step 5: Start Development Server

### Option A: Expo Go (Quickest for Development)

```bash
# Start the development server
npx expo start

# Or with tunnel for cross-network access
npx expo start --tunnel
```

This will display a QR code in your terminal.

### Option B: Development Build (For Native Features)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android
```

---

## Step 6: Preview on Device

### Using Expo Go App

1. **Download Expo Go**:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code**:
   - **iOS**: Open Camera app → Scan QR code → Tap notification
   - **Android**: Open Expo Go → Tap "Scan QR code"

3. **Same Network**: Ensure your phone and computer are on the same WiFi network

### Using Tunnel (Different Networks)

```bash
# Install ngrok for tunneling
npm install -g @expo/ngrok

# Start with tunnel
npx expo start --tunnel
```

### Using Simulators/Emulators

```bash
# iOS Simulator (Mac only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

---

## Step 7: Environment Setup

### Create .env file

```bash
# In your project root, create .env
EXPO_PUBLIC_SUPABASE_URL=https://nqfltvbzqxdxsobhedci.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Update supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## Troubleshooting

### Common Issues

#### Metro Bundler Cache

```bash
# Clear Metro cache
npx expo start --clear
```

#### Node Modules Issues

```bash
# Remove and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### iOS Pod Issues (Mac)

```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

#### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
```

#### NativeWind Not Working

```bash
# Ensure babel config is correct
# Restart Metro with clear cache
npx expo start --clear
```

### Error: "Unable to resolve module"

```bash
# Reset Metro bundler
npx expo start --clear

# Or delete cache manually
rm -rf .expo
rm -rf node_modules/.cache
```

### Error: "Reanimated" plugin issues

Ensure `react-native-reanimated/plugin` is **last** in babel.config.js plugins array.

---

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npx expo start` | Start development server |
| `npx expo start --tunnel` | Start with tunnel (cross-network) |
| `npx expo start --clear` | Start with cleared cache |
| `npx expo start --ios` | Start and open iOS Simulator |
| `npx expo start --android` | Start and open Android Emulator |
| `eas build --profile development` | Create development build |
| `eas build --profile preview` | Create preview APK/IPA |
| `eas build --profile production` | Create production build |
| `eas submit --platform ios` | Submit to App Store |
| `eas submit --platform android` | Submit to Play Store |

---

## Next Steps

1. ✅ Test authentication flow
2. ✅ Verify Supabase connection
3. ✅ Test navigation between screens
4. ✅ Test native features (camera, haptics, etc.)
5. ✅ Create preview build for testing
6. ✅ Submit to app stores

---

## Useful Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [NativeWind](https://www.nativewind.dev/v4/overview)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [EAS Build](https://docs.expo.dev/build/introduction)

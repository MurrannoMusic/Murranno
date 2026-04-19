# React Native Migration Checklist

> **Note:** This checklist is for tracking YOUR migration progress. All screen templates and components are already created in `migration-assets/`. Check off items as you implement them in your new Expo project.

## Pre-Migration Requirements

### Developer Environment
- [ ] Node.js v18+ installed
- [ ] Expo CLI installed globally (`npm install -g expo-cli`)
- [ ] Xcode installed (for iOS development, Mac only)
- [ ] Android Studio installed (for Android development)
- [ ] EAS CLI installed (`npm install -g eas-cli`)

### Accounts Required
- [ ] Expo account created (expo.dev)
- [ ] Apple Developer account (for iOS distribution)
- [ ] Google Play Console account (for Android distribution)

---

## ✅ Pre-Built Templates (Ready to Use)

All templates below are complete and ready to copy. **You don't need to create these—just copy them to your project.**

### Configuration Files
- [x] `App.tsx.template` - Main app entry point with NativeWind v4, navigation, React Query
- [x] `global.css` - NativeWind v4 styles with custom utility classes
- [x] `babel.config.js` - NativeWind v4 + Expo SDK 54 configuration
- [x] `metro.config.js` - Metro bundler with NativeWind CSS support
- [x] `tailwind.config.js` - Tailwind configuration for React Native
- [x] `nativewind.d.ts` - TypeScript declarations for NativeWind

### Core Files
- [x] `lib/supabase.ts` - Supabase client with SecureStore adapter
- [x] `contexts/AuthContext.tsx` - Authentication context and provider
- [x] `navigation/RootNavigator.tsx` - Root navigation with deep linking

### Screen Templates (27 Total)

#### Auth Screens (5)
- [x] `screens/SplashScreen.tsx`
- [x] `screens/WelcomeScreen.tsx`
- [x] `screens/LoginScreen.tsx`
- [x] `screens/SignupScreen.tsx`
- [x] `screens/ForgotPasswordScreen.tsx`

#### Artist Screens (12)
- [x] `screens/artist/ArtistDashboardScreen.tsx`
- [x] `screens/artist/ReleasesScreen.tsx`
- [x] `screens/artist/ReleaseDetailScreen.tsx`
- [x] `screens/artist/UploadScreen.tsx`
- [x] `screens/artist/PromotionsScreen.tsx`
- [x] `screens/artist/PromotionDetailScreen.tsx`
- [x] `screens/artist/EarningsScreen.tsx`
- [x] `screens/artist/AnalyticsScreen.tsx`
- [x] `screens/artist/WalletScreen.tsx`
- [x] `screens/artist/ProfileScreen.tsx`
- [x] `screens/artist/SettingsScreen.tsx`
- [x] `screens/artist/NotificationsScreen.tsx`

#### Label Screens (3)
- [x] `screens/label/LabelDashboardScreen.tsx`
- [x] `screens/label/ArtistRosterScreen.tsx`
- [x] `screens/label/PayoutManagerScreen.tsx`

#### Agency Screens (3)
- [x] `screens/agency/AgencyDashboardScreen.tsx`
- [x] `screens/agency/ClientsScreen.tsx`
- [x] `screens/agency/CampaignResultsScreen.tsx`

#### Shared Screens (4)
- [x] `screens/shared/SupportScreen.tsx`
- [x] `screens/shared/FAQScreen.tsx`
- [x] `screens/shared/PrivacyPolicyScreen.tsx`
- [x] `screens/shared/TermsScreen.tsx`

### Assets
- [x] `assets/mm_logo.png` - App logo
- [x] `assets/musician-background.jpg` - Background image
- [x] `assets/favicon.png` - App icon
- [x] `assets/carousel-1.jpg` - Welcome screen carousel
- [x] `assets/carousel-2.jpg` - Welcome screen carousel
- [x] `assets/carousel-3.jpg` - Welcome screen carousel

### 📁 Directory Structure
```
migration-assets/
├── App.tsx.template
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── global.css
├── nativewind.d.ts
├── MIGRATION_CHECKLIST.md
├── ASSETS_README.md
├── assets/
│   ├── mm_logo.png
│   ├── musician-background.jpg
│   ├── favicon.png
│   ├── carousel-1.jpg
│   ├── carousel-2.jpg
│   └── carousel-3.jpg
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── navigation/
│   └── RootNavigator.tsx
├── screens/
│   ├── auth/
│   ├── artist/
│   ├── label/
│   ├── agency/
│   └── shared/
└── __tests__/
    └── navigation/
        └── NavigationFlow.test.tsx
```

---

## Your Migration Progress

Use the checkboxes below to track what you've implemented in your new Expo project.

### Phase 1: Project Setup

#### 1.1 Create Expo Project
```bash
npx create-expo-app murranno-mobile --template blank-typescript
cd murranno-mobile
```

#### 1.2 Install Core Dependencies
```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Gestures (required for navigation)
npm install react-native-gesture-handler

# State & Data
npm install @tanstack/react-query @supabase/supabase-js
npm install zustand # optional for global state

# Forms
npm install react-hook-form @hookform/resolvers zod

# UI & Styling (NativeWind v4)
npm install nativewind tailwindcss
npm install react-native-reanimated
npm install expo-blur expo-linear-gradient

# Utilities
npm install date-fns clsx

# Offline Support & Persistence
npm install react-native-mmkv @react-native-community/netinfo
npm install @tanstack/query-sync-storage-persister @tanstack/query-async-storage-persister
npm install @tanstack/react-query-persist-client
npm install @react-native-async-storage/async-storage

# Toast notifications
npm install react-native-toast-message
```

#### 1.3 Install Native Modules
```bash
# Core Native Features
npm install expo-haptics expo-local-authentication
npm install expo-camera expo-image-picker
npm install expo-notifications expo-device
npm install expo-clipboard expo-sharing expo-web-browser
npm install expo-network expo-location
npm install expo-secure-store expo-file-system
npm install expo-av # for audio playback
npm install expo-application expo-constants
npm install expo-splash-screen expo-linking
```

#### 1.4 Configure NativeWind v4
```bash
npx tailwindcss init
```

#### 1.5 Copy Migration Assets
```bash
# Copy configuration files
cp migration-assets/babel.config.js ./
cp migration-assets/metro.config.js ./
cp migration-assets/tailwind.config.js ./
cp migration-assets/global.css ./
cp migration-assets/nativewind.d.ts ./

# Copy App.tsx template
cp migration-assets/App.tsx.template ./App.tsx

# Copy assets
cp -r migration-assets/assets ./

# Copy source files
mkdir -p src/lib src/contexts src/navigation src/screens
cp migration-assets/lib/supabase.ts src/lib/
cp migration-assets/contexts/AuthContext.tsx src/contexts/
cp migration-assets/navigation/RootNavigator.tsx src/navigation/
cp -r migration-assets/screens/* src/screens/
```

#### 1.6 Clean Install
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

---

### Phase 2: File Copying Progress

#### Types (copy directly)
- [ ] `src/types/wallet.ts`
- [ ] `src/types/release.ts` (if exists)
- [ ] `src/integrations/supabase/types.ts`

#### Contexts (adapt for React Native)
- [ ] `src/contexts/AuthContext.tsx` copied
- [ ] `src/contexts/ToastContext.tsx` → use native toast

#### Data Hooks (copy with minor edits)
- [ ] `src/hooks/useArtist.ts`
- [ ] `src/hooks/useReleases.ts`
- [ ] `src/hooks/useEarnings.ts`
- [ ] `src/hooks/useWallet.ts`
- [ ] `src/hooks/useCampaigns.ts`

---

### Phase 3: Screen Implementation Progress

Track which screens you've integrated and tested in your project:

#### Auth Screens
- [ ] SplashScreen
- [ ] WelcomeScreen
- [ ] LoginScreen
- [ ] SignupScreen
- [ ] ForgotPasswordScreen

#### Artist Screens
- [ ] ArtistDashboardScreen
- [ ] ReleasesScreen
- [ ] ReleaseDetailScreen
- [ ] UploadScreen
- [ ] PromotionsScreen
- [ ] PromotionDetailScreen
- [ ] EarningsScreen
- [ ] AnalyticsScreen
- [ ] WalletScreen
- [ ] ProfileScreen
- [ ] SettingsScreen
- [ ] NotificationsScreen

#### Label Screens
- [ ] LabelDashboardScreen
- [ ] ArtistRosterScreen
- [ ] PayoutManagerScreen

#### Agency Screens
- [ ] AgencyDashboardScreen
- [ ] ClientsScreen
- [ ] CampaignResultsScreen

#### Shared Screens
- [ ] SupportScreen
- [ ] FAQScreen
- [ ] PrivacyPolicyScreen
- [ ] TermsScreen

---

### Phase 4: Navigation Setup

#### 4.1 Root Navigator
- [ ] Deep linking configured (custom scheme `murranno://`)
- [ ] AuthNavigator configured
- [ ] MainTabNavigator configured
- [ ] iOS Universal Links configured
- [ ] Android App Links configured
- [ ] Navigation theme applied

#### 4.2 Tab Navigator
- [ ] Artist tabs (Home, Releases, Promotions, Earnings, Profile)
- [ ] Label tabs (Dashboard, Artists, Releases, Wallet, Settings)
- [ ] Agency tabs (Dashboard, Campaigns, Clients, Analytics, Settings)

#### 4.3 Stack Navigators
- [ ] ArtistStackNavigator
- [ ] LabelStackNavigator
- [ ] AgencyStackNavigator

---

### Phase 5: Native Features Integration

#### 5.1 Push Notifications
- [ ] Configure expo-notifications
- [ ] Request permissions
- [ ] Save token to database
- [ ] Handle incoming notifications

#### 5.2 Biometric Authentication
- [ ] Check device support
- [ ] Implement secure login

#### 5.3 Haptic Feedback
- [ ] Add to button presses
- [ ] Add to navigation
- [ ] Add to success/error states

#### 5.4 Offline Support
- [ ] Setup MMKV storage (or AsyncStorage fallback)
- [ ] Configure React Query persistence
- [ ] Setup network status monitoring
- [ ] Add OfflineIndicator component
- [ ] Test offline data access
- [ ] Test mutation queuing
- [ ] Test sync on reconnect

#### 5.5 Deep Linking
- [ ] Configure custom URL scheme (`murranno://`)
- [ ] Set up iOS Universal Links
  - [ ] Create AASA file on server
  - [ ] Add associated domains to app config
  - [ ] Validate with Apple's tool
- [ ] Set up Android App Links
  - [ ] Create assetlinks.json on server
  - [ ] Add intent filters to app config
  - [ ] Get SHA256 fingerprints from EAS
  - [ ] Validate with Google's tool
- [ ] Implement DeepLinkingService
- [ ] Implement useDeepLinking hook
- [ ] Test OAuth callback handling
- [ ] Test deferred deep linking (auth-required routes)
- [ ] Test cold start deep links
- [ ] Test warm start deep links

---

### Phase 6: Testing

#### 6.1 Unit Tests
```bash
npm install --save-dev jest @testing-library/react-native
```
- [ ] Test hooks
- [ ] Test utilities
- [ ] Test navigation

#### 6.2 Device Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical iOS device
- [ ] Test on physical Android device

---

### Phase 7: Build & Deployment

#### 7.1 Configure EAS
```bash
eas login
eas build:configure
```

#### 7.2 Update app.json
- [ ] Set correct bundle identifier
- [ ] Configure splash screen
- [ ] Configure app icons
- [ ] Set version numbers

#### 7.3 Build Commands
```bash
# Development builds
eas build --profile development --platform ios
eas build --profile development --platform android

# Production builds
eas build --profile production --platform ios
eas build --profile production --platform android
```

#### 7.4 Submit to Stores
```bash
eas submit --platform ios
eas submit --platform android
```

---

### Phase 8: App Store Preparation

#### iOS App Store Assets
- [ ] Prepare 6.7" iPhone screenshots (1290 × 2796) - minimum 3
- [ ] Prepare 6.5" iPhone screenshots (1242 × 2688) - minimum 3
- [ ] Prepare 5.5" iPhone screenshots (1242 × 2208) - minimum 3
- [ ] Create app preview video (15-30 sec, optional)
- [ ] Write app description (4000 chars max)
- [ ] Define keywords (100 chars max)
- [ ] Set up privacy policy URL
- [ ] Complete age rating questionnaire

#### Google Play Store Assets
- [ ] Prepare phone screenshots (1080 × 1920) - 2-8 required
- [ ] Create feature graphic (1024 × 500)
- [ ] Write short description (80 chars)
- [ ] Write full description (4000 chars)
- [ ] Complete data safety form
- [ ] Complete content rating questionnaire

---

## Quick Reference Commands

```bash
# Start development
npx expo start

# Start with clear cache
npx expo start --clear

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Build for testing
eas build --profile preview

# Update OTA
eas update --branch production

# Check project health
npx expo-doctor
```

---

## Environment Variables

Create `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Troubleshooting

### Common Issues

1. **Metro bundler cache**: `npx expo start --clear`
2. **iOS pod issues**: `cd ios && pod install --repo-update`
3. **Android gradle issues**: `cd android && ./gradlew clean`
4. **Type errors**: Check `tsconfig.json` paths
5. **NativeWind not working**: Ensure `import './global.css'` is at top of App.tsx

### NativeWind v4 Specific Issues

1. **Styles not applying**: Check that `global.css` is imported in App.tsx
2. **Metro errors**: Ensure `metro.config.js` has `withNativeWind` wrapper
3. **TypeScript errors**: Add `nativewind.d.ts` to project root

### Useful Resources
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [NativeWind v4](https://www.nativewind.dev/v4/overview)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [EAS Build](https://docs.expo.dev/build/introduction/)

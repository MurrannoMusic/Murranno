# Murranno Music - React Native Migration Assets Summary

This document provides a complete inventory of all migration assets created for converting the web app to React Native.

## 📁 Directory Structure

```
migration-assets/
├── components/
│   ├── form/
│   │   ├── Checkbox.tsx
│   │   ├── DatePicker.tsx
│   │   ├── index.ts
│   │   ├── Select.tsx
│   │   ├── Switch.tsx
│   │   └── TextInput.tsx
│   ├── ui/
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── index.ts
│   │   ├── LoadingSpinner.tsx
│   │   └── Toast.tsx
│   └── AudioPlayer.tsx
├── config/
│   ├── nativewind.ts
│   └── supabase.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── index.ts
│   └── ThemeContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useNotifications.ts
│   └── useSupabaseAuth.ts
├── navigation/
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── types.ts
├── screens/
│   ├── ArtistRosterScreen.tsx
│   ├── CampaignDetailsScreen.tsx
│   ├── CampaignResultsScreen.tsx
│   ├── CampaignsScreen.tsx
│   ├── ClientsScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── EarningsScreen.tsx
│   ├── index.ts
│   ├── LoginScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── PayoutManagerScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── PromotionDetailsScreen.tsx
│   ├── PromotionsScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── ReleaseDetailsScreen.tsx
│   ├── ReleasesScreen.tsx
│   ├── SettingsScreen.tsx
│   └── TrackUploadScreen.tsx
├── services/
│   ├── FileUploadService.ts
│   └── PushNotificationService.tsx
├── ASSETS_SUMMARY.md
└── MIGRATION_CHECKLIST.md
```

## 📦 Components

### UI Components (`components/ui/`)

| Component | Purpose | Web Equivalent |
|-----------|---------|----------------|
| `Button.tsx` | Primary button with variants | `src/components/ui/button.tsx` |
| `Card.tsx` | Container with shadow/border | `src/components/ui/card.tsx` |
| `Badge.tsx` | Status/label badges | `src/components/ui/badge.tsx` |
| `Toast.tsx` | Notification toasts | `sonner` toast |
| `LoadingSpinner.tsx` | Loading indicator | Various loading states |

### Form Components (`components/form/`)

| Component | Purpose | Web Equivalent |
|-----------|---------|----------------|
| `TextInput.tsx` | Text input with label/error | `src/components/ui/input.tsx` |
| `Select.tsx` | Dropdown select with modal | `src/components/ui/select.tsx` |
| `DatePicker.tsx` | Date selection | `react-day-picker` |
| `Checkbox.tsx` | Checkbox input | `src/components/ui/checkbox.tsx` |
| `Switch.tsx` | Toggle switch | `src/components/ui/switch.tsx` |

### Feature Components

| Component | Purpose |
|-----------|---------|
| `AudioPlayer.tsx` | Track playback with controls |

## 📱 Screens

### Authentication Screens

| Screen | Purpose | Web Route |
|--------|---------|-----------|
| `OnboardingScreen.tsx` | First-time user intro | `/welcome` |
| `LoginScreen.tsx` | User login | `/auth` (login tab) |
| `RegisterScreen.tsx` | User registration | `/auth` (signup tab) |

### Main App Screens

| Screen | Purpose | Web Route |
|--------|---------|-----------|
| `DashboardScreen.tsx` | Home dashboard | `/` or `/dashboard` |
| `ReleasesScreen.tsx` | Music releases list | `/releases` |
| `ReleaseDetailsScreen.tsx` | Single release view | `/releases/:id` |
| `TrackUploadScreen.tsx` | Upload new tracks | Part of release flow |
| `CampaignsScreen.tsx` | Campaigns list | `/campaigns` |
| `CampaignDetailsScreen.tsx` | Campaign details | `/campaigns/:id` |
| `EarningsScreen.tsx` | Earnings overview | `/earnings` |
| `PromotionsScreen.tsx` | Promotion services | `/promotions` |
| `PromotionDetailsScreen.tsx` | Service details | `/promotions/:id` |
| `NotificationsScreen.tsx` | Notifications list | Dropdown in header |
| `ProfileScreen.tsx` | User profile | `/profile` |
| `SettingsScreen.tsx` | App settings | `/settings` |

### Label Dashboard Screens

| Screen | Purpose | Web Route |
|--------|---------|-----------|
| `ArtistRosterScreen.tsx` | Manage label artists | `/label/artists` |
| `PayoutManagerScreen.tsx` | Artist payouts | `/label/payouts` |

### Agency Dashboard Screens

| Screen | Purpose | Web Route |
|--------|---------|-----------|
| `ClientsScreen.tsx` | Agency clients | `/agency/clients` |
| `CampaignResultsScreen.tsx` | Campaign analytics | `/agency/results` |

## 🧭 Navigation

| File | Purpose |
|------|---------|
| `AppNavigator.tsx` | Root navigator with auth state |
| `AuthNavigator.tsx` | Auth flow navigation |
| `MainTabNavigator.tsx` | Main app tab navigation |
| `types.ts` | TypeScript navigation types |

## 🎣 Hooks

| Hook | Purpose | Web Equivalent |
|------|---------|----------------|
| `useAuth.ts` | Auth context hook | `src/hooks/useAuth.ts` |
| `useSupabaseAuth.ts` | Supabase auth operations | Same |
| `useNotifications.ts` | In-app notifications | Same |

## 🌍 Contexts

| Context | Purpose |
|---------|---------|
| `AuthContext.tsx` | Authentication state management |
| `ThemeContext.tsx` | Theme (light/dark) management |
| `CartContext.tsx` | Shopping cart for promotions |

## 🔧 Services

| Service | Purpose |
|---------|---------|
| `FileUploadService.ts` | Audio/image upload to Supabase |
| `PushNotificationService.tsx` | Push notification handling |
| `OfflineStorageService.ts` | MMKV/AsyncStorage adapter for offline data |
| `QueryPersister.ts` | React Query cache persistence configuration |

## ⚙️ Configuration

| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client with AsyncStorage |
| `nativewind.ts` | NativeWind/Tailwind setup |
| `app.config.ts` | Expo app configuration with splash/icons/deep links |
| `deepLinkingConfig.ts` | Centralized deep link route configuration |
| `apple-app-site-association.json` | iOS Universal Links AASA file template |
| `assetlinks.json` | Android App Links Digital Asset Links template |

## 📚 Documentation

| File | Purpose |
|------|---------|
| `MIGRATION_CHECKLIST.md` | Step-by-step migration guide |
| `ASSETS_SUMMARY.md` | This file - asset inventory |
| `SPLASH_AND_ICONS_GUIDE.md` | Splash screen & app icon setup guide |
| `APP_STORE_ASSETS_GUIDE.md` | App Store & Play Store submission assets guide |
| `DEPLOYMENT.md` | EAS Build & deployment guide |
| `DEEP_LINKING_GUIDE.md` | iOS Universal Links & Android App Links setup guide |

## 🔗 Deep Linking

| Component/File | Purpose |
|----------------|---------|
| `DeepLinkingService.ts` | URL parsing, route matching, OAuth token extraction |
| `useDeepLinking.ts` | Hook for handling deep links with deferred auth support |
| `deepLinkingConfig.ts` | Centralized route definitions and helpers |

## 🔌 Offline Support

| Component/Hook | Purpose |
|----------------|---------|
| `OfflineIndicator.tsx` | Visual indicator for offline/syncing status |
| `useNetworkStatus.ts` | Network connectivity monitoring hook |
| `QueryProvider.tsx` | React Query provider with persistence |

## 🔗 Web to Native Mapping

### Routing

| Web Route | Native Screen | Navigator |
|-----------|--------------|-----------|
| `/` | `DashboardScreen` | `MainTabNavigator` |
| `/auth` | `LoginScreen/RegisterScreen` | `AuthNavigator` |
| `/releases` | `ReleasesScreen` | `MainTabNavigator` |
| `/releases/:id` | `ReleaseDetailsScreen` | Modal in `AppNavigator` |
| `/campaigns` | `CampaignsScreen` | `MainTabNavigator` |
| `/campaigns/:id` | `CampaignDetailsScreen` | Modal in `AppNavigator` |
| `/earnings` | `EarningsScreen` | `MainTabNavigator` |
| `/promotions` | `PromotionsScreen` | `MainTabNavigator` |
| `/profile` | `ProfileScreen` | `MainTabNavigator` |
| `/settings` | `SettingsScreen` | `MainTabNavigator` |

### Libraries

| Web Library | Native Replacement |
|-------------|-------------------|
| `react-router-dom` | `@react-navigation/native` |
| `tailwindcss` | `nativewind` |
| `sonner` | Custom `Toast` component |
| `lucide-react` | `lucide-react-native` |
| `react-day-picker` | `@react-native-community/datetimepicker` |
| `recharts` | `react-native-svg-charts` |

### Storage

| Web Storage | Native Storage |
|-------------|---------------|
| `localStorage` | `@react-native-async-storage/async-storage` |
| `sessionStorage` | `AsyncStorage` or in-memory |

## 📲 Native-Only Features

These features are native-specific and don't exist in the web version:

1. **Push Notifications** - `PushNotificationService.tsx`
2. **Audio Background Playback** - `AudioPlayer.tsx`
3. **Biometric Authentication** - Can be added with `expo-local-authentication`
4. **Camera Access** - `FileUploadService.ts` (for cover art)
5. **Deep Linking** - Configured in `AppNavigator.tsx`

## 🚀 Getting Started

1. Create a new React Native project with Expo
2. Copy the `migration-assets` folder to your project
3. Follow `MIGRATION_CHECKLIST.md` for setup steps
4. Install required dependencies
5. Configure Supabase client with your project keys
6. Start migrating screens one by one

## 📝 Notes

- All components use NativeWind for styling (Tailwind CSS syntax)
- Colors and theming follow the web app's design system
- Authentication flow mirrors the web app exactly
- Data fetching uses the same Supabase queries

## 🔄 Keeping in Sync

When updating the web app:
1. Check if changes affect shared logic (hooks, services)
2. Update corresponding native components
3. Test both platforms for feature parity
4. Update this summary if new files are added

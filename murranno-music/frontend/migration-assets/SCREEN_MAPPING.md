# Screen Mapping Guide: Web to React Native

This document maps all web app routes to their corresponding React Native screens.

## Authentication Screens

| Web Route | React Native Screen | Status |
|-----------|---------------------|--------|
| `/login` | `LoginScreen.tsx` | ✅ Complete |
| `/signup` | `SignUpScreen.tsx` | ✅ Complete |
| `/forgot-password` | `ForgotPasswordScreen.tsx` | ✅ Complete |
| `/user-type` | `UserTypeSelectionScreen.tsx` | ✅ Complete |
| `/` (splash) | `SplashScreen.tsx` | ✅ Complete |

## Artist Dashboard Screens

| Web Route | React Native Screen | Status |
|-----------|---------------------|--------|
| `/dashboard` | `HomeScreen.tsx` | ✅ Complete |
| `/releases` | `ReleasesScreen.tsx` | ✅ Complete |
| `/releases/:id` | `ReleaseDetailScreen.tsx` | ✅ Complete |
| `/upload` | `UploadScreen.tsx` | ✅ Complete |
| `/analytics` | `AnalyticsScreen.tsx` | ✅ Complete |
| `/wallet` | `WalletScreen.tsx` | ✅ Complete |
| `/promotions` | `PromotionsScreen.tsx` | ✅ Complete |
| `/promotions/:id` | `PromotionsDetailScreen.tsx` | ✅ Complete |
| `/campaigns` | `CampaignTrackingScreen.tsx` | ✅ Complete |
| `/profile` | `ArtistProfileScreen.tsx` | ✅ Complete |
| `/settings` | `SettingsScreen.tsx` | ✅ Complete |
| `/notifications` | `NotificationsScreen.tsx` | ✅ Complete |

## Label Dashboard Screens

| Web Route | React Native Screen | Status |
|-----------|---------------------|--------|
| `/label/dashboard` | `LabelDashboardScreen.tsx` | ✅ Complete |
| `/label/artists` | `ReleasesScreen.tsx` (reused) | ⏳ Placeholder |
| `/label/artists/:id` | `ArtistProfileScreen.tsx` (reused) | ⏳ Placeholder |
| `/label/releases` | `ReleasesScreen.tsx` | ✅ Complete |
| `/label/analytics` | `AnalyticsScreen.tsx` | ✅ Complete |
| `/label/wallet` | `WalletScreen.tsx` | ✅ Complete |
| `/label/payouts` | `WalletScreen.tsx` (reused) | ⏳ Placeholder |

## Agency Dashboard Screens

| Web Route | React Native Screen | Status |
|-----------|---------------------|--------|
| `/agency/dashboard` | `AgencyDashboardScreen.tsx` | ✅ Complete |
| `/agency/campaigns` | `PromotionsScreen.tsx` (reused) | ⏳ Placeholder |
| `/agency/campaigns/:id` | `CampaignTrackingScreen.tsx` | ✅ Complete |
| `/agency/clients` | `ReleasesScreen.tsx` (reused) | ⏳ Placeholder |
| `/agency/analytics` | `AnalyticsScreen.tsx` | ✅ Complete |
| `/agency/results` | `AnalyticsScreen.tsx` (reused) | ⏳ Placeholder |

## Navigation Structure

```
RootNavigator
├── AuthNavigator
│   ├── SplashScreen
│   ├── LoginScreen
│   ├── SignUpScreen
│   ├── ForgotPasswordScreen
│   └── UserTypeSelectionScreen
│
├── MainTabNavigator (Artist)
│   ├── Home → ArtistStackNavigator
│   ├── Releases
│   ├── Promotions
│   ├── Wallet
│   └── Settings
│
├── MainTabNavigator (Label)
│   ├── Dashboard → LabelStackNavigator
│   ├── Artists
│   ├── Releases
│   ├── Wallet
│   └── Settings
│
└── MainTabNavigator (Agency)
    ├── Dashboard → AgencyStackNavigator
    ├── Campaigns
    ├── Clients
    ├── Wallet
    └── Settings
```

## Component Mapping

| Web Component | React Native Component | Location |
|---------------|----------------------|----------|
| `Sidebar` | `MainTabNavigator` | `navigation/` |
| `TopNav` | `TopBar` | `components/shared/` |
| `PageHeader` | `PageHeader` | `components/shared/` |
| `StatCard` | `StatCardCarousel` | `components/shared/` |
| `TransactionRow` | `TransactionRow` | `components/shared/` |
| `ActivityItem` | `ActivityItem` | `components/shared/` |
| `SearchInput` | `SearchInput` | `components/shared/` |
| `FilterPills` | `FilterPills` | `components/shared/` |
| `FloatingActionButton` | `FloatingActionButton` | `components/shared/` |
| `NewsCarousel` | `NewsCarousel` | `components/shared/` |
| `BottomSheet/Drawer` | `BottomSheet` | `components/shared/` |

## UI Components Mapping

| Web Component (shadcn) | React Native Component | Location |
|------------------------|----------------------|----------|
| `Button` | `Button` | `components/ui/` |
| `Card` | `Card` | `components/ui/` |
| `Input` | `Input` | `components/ui/` |
| `Badge` | `Badge` | `components/ui/` |
| `Avatar` | `Avatar` | `components/ui/` |
| `Progress` | `Progress` | `components/ui/` |
| `Switch` | `Switch` | `components/ui/` |
| `Checkbox` | `Checkbox` | `components/ui/` |
| `Separator` | `Separator` | `components/ui/` |
| `Skeleton` | `Skeleton` | `components/ui/` |
| `Tabs` | `Tabs` | `components/ui/` |
| `Toast` | `Toast` | `components/ui/` |
| `Sheet` | `Sheet` | `components/ui/` |
| `Dialog` | `Dialog` | `components/ui/` |

## Deep Linking Configuration

```typescript
const linking = {
  prefixes: ['murranno://', 'https://murranno.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          SignUp: 'signup',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          Home: 'dashboard',
          Releases: 'releases',
          ReleaseDetail: 'releases/:id',
          Upload: 'upload',
          Analytics: 'analytics',
          Wallet: 'wallet',
          Promotions: 'promotions',
          Settings: 'settings',
        },
      },
      Label: {
        screens: {
          Dashboard: 'label/dashboard',
          Artists: 'label/artists',
          Releases: 'label/releases',
        },
      },
      Agency: {
        screens: {
          Dashboard: 'agency/dashboard',
          Campaigns: 'agency/campaigns',
          Clients: 'agency/clients',
        },
      },
    },
  },
};
```

## Theme Token Mapping

| CSS Variable | React Native Token | Value |
|--------------|-------------------|-------|
| `--background` | `colors.background` | `#0A0A0A` |
| `--foreground` | `colors.foreground` | `#FFFFFF` |
| `--primary` | `colors.primary` | `#1DB954` |
| `--secondary` | `colors.secondary` | `#1A1A2E` |
| `--muted` | `colors.muted` | `#27272A` |
| `--accent` | `colors.accent` | `#2DD4BF` |
| `--destructive` | `colors.destructive` | `#EF4444` |
| `--border` | `colors.border` | `rgba(255,255,255,0.1)` |
| `--card` | `colors.card` | `#111111` |

## Animation Mapping

| CSS Animation | React Native (Reanimated) |
|---------------|---------------------------|
| `animate-fade-in` | `FadeIn.duration(300)` |
| `animate-slide-up` | `SlideInUp.duration(300)` |
| `animate-scale-in` | `ZoomIn.duration(200)` |
| `hover:scale-105` | `withSpring(1.05)` |
| `transition-all` | `withTiming()` |

## Usage Examples

### Navigating Between Screens

```typescript
// From Artist Home to Release Detail
navigation.navigate('ReleaseDetail', { releaseId: '123' });

// From any screen to Upload
navigation.navigate('Upload');

// Switch tabs
navigation.navigate('Wallet');
```

### Using Shared Components

```typescript
import { TopBar, PageHeader, StatCardCarousel } from '../components/shared';

const MyScreen = () => (
  <View>
    <TopBar title="My Screen" />
    <PageHeader 
      title="Page Title" 
      subtitle="Description"
      onBack={() => navigation.goBack()}
    />
    <StatCardCarousel data={stats} />
  </View>
);
```

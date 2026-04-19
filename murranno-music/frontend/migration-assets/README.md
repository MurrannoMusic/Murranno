# React Native Migration Assets

This folder contains complete React Native (Expo) templates that match the current web app's design system exactly.

## Directory Structure

```
migration-assets/
├── theme/                    # Design system tokens
│   ├── colors.ts            # Color palette (dark/light themes) with opacity helpers
│   ├── typography.ts        # Font styles, sizes, weights
│   ├── spacing.ts           # Spacing scale, border radius
│   ├── shadows.ts           # Shadow presets (iOS/Android)
│   ├── animations.ts        # Animation helpers
│   ├── gradients.ts         # Gradient definitions for LinearGradient
│   ├── utilities.ts         # Pre-composed utility styles matching web
│   └── index.ts             # Central export
│
├── components/
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx       # All button variants with haptics
│   │   ├── Card.tsx         # Card with glass morphism
│   │   ├── Input.tsx        # Text input with states
│   │   ├── Badge.tsx        # Status badges
│   │   ├── Avatar.tsx       # User avatars with fallback
│   │   ├── Progress.tsx     # Animated progress bar
│   │   ├── Switch.tsx       # Toggle switch with haptics
│   │   ├── Checkbox.tsx     # Animated checkbox
│   │   ├── Separator.tsx    # Horizontal/vertical divider
│   │   ├── Skeleton.tsx     # Loading skeletons
│   │   ├── Tabs.tsx         # Tab navigation (default/pills)
│   │   ├── Toast.tsx        # Toast notifications with provider
│   │   ├── Sheet.tsx        # Bottom sheet modal
│   │   ├── Dialog.tsx       # Dialog and AlertDialog
│   │   └── index.ts         # Central export
│   │
│   ├── layout/              # Layout components
│   │   ├── BottomNavigation.tsx
│   │   ├── PageContainer.tsx
│   │   └── AppHeader.tsx
│   │
│   └── modern/              # Modern design components
│       ├── StatCard.tsx
│       └── PortfolioCard.tsx
│
├── screens/                  # Screen templates
│   ├── SplashScreen.tsx     # Animated splash
│   ├── WelcomeScreen.tsx    # Onboarding with carousel
│   └── NotFoundScreen.tsx   # 404 error screen
│
├── navigation/               # React Navigation setup (Phase 4)
│   ├── types.ts             # Type definitions for all navigators
│   ├── RootNavigator.tsx    # Root navigation with auth state
│   ├── AuthNavigator.tsx    # Auth flow (splash → login)
│   ├── MainTabNavigator.tsx # Bottom tab navigation
│   ├── index.ts             # Navigation exports
│   └── stacks/              # Stack navigators
│       ├── DashboardNavigator.tsx
│       ├── ReleasesNavigator.tsx
│       ├── PromotionsNavigator.tsx
│       ├── EarningsNavigator.tsx
│       ├── ProfileNavigator.tsx
│       └── AdminNavigator.tsx
│
├── hooks/                    # React Native hooks
│   ├── useAuth.ts           # Authentication hook
│   └── useNativeFeatures.ts # Native feature hooks
│
├── App.tsx.template         # Main app template
├── package.json.template    # Dependencies
├── supabase-client.ts       # Supabase configuration
├── tailwind.config.js       # NativeWind configuration
├── babel.config.js          # Babel config for NativeWind
├── metro.config.js          # Metro bundler config
├── global.css               # Global CSS for NativeWind
└── nativewind.d.ts          # TypeScript declarations
```

## Setup Instructions

### 1. Create New Expo Project

```bash
npx create-expo-app murranno-music-rn --template expo-template-blank-typescript
cd murranno-music-rn
```

### 2. Install Dependencies

```bash
# Copy package.json dependencies and run:
npm install

# Or using the template:
cp migration-assets/package.json.template package.json
npm install
```

### 3. Configure NativeWind (Phase 2)

```bash
# Copy configuration files
cp migration-assets/tailwind.config.js tailwind.config.js
cp migration-assets/babel.config.js babel.config.js
cp migration-assets/metro.config.js metro.config.js
cp migration-assets/global.css global.css
cp migration-assets/nativewind.d.ts nativewind.d.ts

# Import global.css in your App.tsx:
import './global.css';
```

### 4. Copy Theme Files

```bash
mkdir -p src/theme
cp migration-assets/theme/* src/theme/
```

### 5. Copy Components

```bash
mkdir -p src/components/{ui,layout,modern}
cp migration-assets/components/ui/* src/components/ui/
cp migration-assets/components/layout/* src/components/layout/
cp migration-assets/components/modern/* src/components/modern/
```

### 6. Copy Screens

```bash
mkdir -p src/screens
cp migration-assets/screens/* src/screens/
```

### 7. Configure Supabase

```bash
mkdir -p src/services
cp migration-assets/supabase-client.ts src/services/supabase.ts

# Update with your project credentials
```

## Design System Mapping

### Colors (Web CSS → React Native)

| CSS Variable | React Native Import |
|--------------|---------------------|
| `hsl(var(--primary))` | `colors.primary.DEFAULT` |
| `hsl(var(--primary-glow))` | `colors.primary.glow` |
| `hsl(var(--background))` | `colors.background` |
| `hsl(var(--card))` | `colors.card.DEFAULT` |
| `hsl(var(--muted-foreground))` | `colors.muted.foreground` |
| `hsl(var(--success))` | `colors.success.DEFAULT` |
| `hsl(var(--warning))` | `colors.warning.DEFAULT` |

### Color with Opacity (Web → React Native)

| Web Class | React Native |
|-----------|--------------|
| `bg-card/80` | `colorVariants.card[80]` or `withOpacity(colors.card.DEFAULT, 0.8)` |
| `bg-primary/15` | `colorVariants.primary[15]` |
| `border-border/30` | `colorVariants.border[30]` |
| `text-foreground/90` | `colorVariants.foreground[90]` |

### Gradients (Web CSS → React Native)

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme';

// Web: background: var(--gradient-primary)
<LinearGradient {...gradients.primary} style={styles.container}>

// Web: background: var(--gradient-mesh)
<LinearGradient {...gradients.mesh} style={styles.background}>

// Web: background: var(--gradient-accent)
<LinearGradient {...gradients.accent} style={styles.button}>
```

### Utility Classes (Web → React Native)

| Web Class | React Native Style Import |
|-----------|---------------------------|
| `.modern-card` | `utilityStyles.modernCard` |
| `.stat-card` | `utilityStyles.statCard` |
| `.glass-card` | `utilityStyles.glassCard` |
| `.glass-nav` | `utilityStyles.glassNav` |
| `.pill-button` | `utilityStyles.pillButton` |
| `.ghost-button` | `utilityStyles.ghostButton` |
| `.fab` | `utilityStyles.fab` |
| `.nav-item` | `utilityStyles.navItem` |
| `.nav-item.active` | `utilityStyles.navItemActive` |
| `.heading-xl` | `textStyles.headingXl` |
| `.heading-lg` | `textStyles.headingLg` |
| `.body-md` | `textStyles.bodyMd` |
| `.body-sm` | `textStyles.bodySm` |

### NativeWind Classes (Tailwind-style in RN)

These classes work directly in React Native with NativeWind:

```tsx
// These work identically to web
<View className="bg-card/80 border border-border/30 rounded-3xl p-4" />
<Text className="text-foreground text-xl font-bold" />
<View className="flex-row items-center gap-4" />

// Custom component classes
<View className="modern-card" />
<View className="stat-card" />
<View className="glass-card" />
```

### Shadow Mapping (Web → React Native)

| Web Shadow | React Native |
|------------|--------------|
| `shadow-primary` | `shadows.primary` |
| `shadow-secondary` | `shadows.secondary` |
| `shadow-accent` | `shadows.accent` |
| `shadow-glow` | `shadows.glow` |
| `shadow-soft` | `shadows.soft` |

### Components (Web → React Native)

| Web Component | React Native Component |
|---------------|------------------------|
| `<Button variant="pill">` | `<Button variant="pill">` |
| `<Button variant="glass">` | `<Button variant="glass">` |
| `<Card>` | `<Card>` |
| `<Card className="glass-card">` | `<Card variant="glass">` |
| `<Input>` | `<Input>` |
| `BottomNavigation` | `BottomNavigation` |
| `PageContainer` | `PageContainer` |

### Animations

| Web Animation | React Native Equivalent |
|---------------|------------------------|
| `transition-smooth` | `Animated.timing` with `timing.smooth` |
| `transition-bounce` | `Animated.spring` with `spring.bouncy` |
| `hover:scale-105` | `onPressIn` → scale animation |
| `animate-float` | `createFloatAnimation()` |
| `animate-fade-in` | `createFadeInAnimation()` |

## Component Usage Examples

### Button

```tsx
import { Button } from '@/components/ui/Button';

// Primary pill button (matches web)
<Button variant="pill" size="lg" onPress={handlePress}>
  Get Started
</Button>

// With haptic feedback disabled
<Button variant="ghost" disableHaptics>
  Cancel
</Button>
```

### Card with Glass Effect

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card variant="glass" onPress={handlePress}>
  <CardHeader>
    <CardTitle>Earnings</CardTitle>
  </CardHeader>
  <CardContent>
    <PortfolioCard value="₦125,000" change={12.5} changeType="positive" />
  </CardContent>
</Card>
```

### Using Gradients

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/theme';

// Mesh background (like PageContainer)
<LinearGradient 
  colors={gradients.mesh.colors}
  locations={gradients.mesh.locations}
  start={gradients.mesh.start}
  end={gradients.mesh.end}
  style={StyleSheet.absoluteFill}
/>

// Button with gradient
<LinearGradient {...gradients.primary} style={styles.button}>
  <Text>Click Me</Text>
</LinearGradient>
```

### Using Utility Styles

```tsx
import { utilityStyles, textStyles } from '@/theme';

<View style={utilityStyles.modernCard}>
  <Text style={textStyles.headingLg}>Dashboard</Text>
  <Text style={textStyles.bodySm}>Welcome back</Text>
</View>
```

### Page Layout

```tsx
import { PageContainer } from '@/components/layout/PageContainer';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export const DashboardScreen = () => {
  return (
    <>
      <PageContainer scrollable hasBottomNav useMeshBackground>
        {/* Content */}
      </PageContainer>
      <BottomNavigation 
        currentRoute="ArtistDashboard"
        onNavigate={handleNavigate}
        userType="artist"
      />
    </>
  );
};
```

## Files That Can Be Directly Copied

These files from the web app can be used with minimal changes:

### Types (No changes needed)
- `src/types/analytics.ts`
- `src/types/campaign.ts`
- `src/types/news.ts`
- `src/types/payout.ts`
- `src/types/promotion.ts`
- `src/types/release.ts`
- `src/types/stats.ts`
- `src/types/user.ts`
- `src/types/wallet.ts`

### Utils (Minor changes)
- `src/utils/formatters.ts` - Direct copy
- `src/lib/cloudinary.ts` - Update imports

### Contexts (Update imports)
- `src/contexts/CartContext.tsx` - Update supabase import

### Data Hooks (Update imports)
- All `use*.ts` hooks in `src/hooks/` that don't use Capacitor

## Backend Compatibility

All existing edge functions work without changes:
- Same Supabase project
- Same API endpoints
- Same database schema
- Same RLS policies

## Migration Phases

- [x] **Phase 1**: Project setup, dependencies, Supabase config
- [x] **Phase 2**: NativeWind configuration, complete theme system
- [x] **Phase 3**: Complete UI component library
- [x] **Phase 4**: Navigation setup with React Navigation (RootNavigator, AuthNavigator, MainTabNavigator, 6 stack navigators, deep linking, useAppNavigation hook)
- [ ] **Phase 5**: Screen templates
- [ ] **Phase 6**: Native features integration
- [ ] **Phase 7**: Testing and QA
- [ ] **Phase 8**: App store submission

## Support

For questions about the migration, refer to:
- `REACT_NATIVE_MIGRATION.md` - Full migration guide
- Expo documentation: https://docs.expo.dev
- NativeWind documentation: https://www.nativewind.dev

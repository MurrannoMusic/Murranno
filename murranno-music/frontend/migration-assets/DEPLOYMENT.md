# Deployment Guide - EAS Build

## Prerequisites

1. **Expo Account**: Create at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **Apple Developer Account** (for iOS): $99/year at [developer.apple.com](https://developer.apple.com)
4. **Google Play Console** (for Android): $25 one-time at [play.google.com/console](https://play.google.com/console)

---

## Initial Setup

### 1. Configure EAS Project

```bash
# Initialize EAS in your project
eas init

# This will create/update your eas.json and link to Expo
```

### 2. Update Configuration Files

Replace placeholders in `app.config.ts`:
- `your-eas-project-id` → Your actual EAS project ID
- Apple Team ID in `eas.json`

Replace placeholders in `eas.json`:
- `your-apple-id@email.com` → Your Apple ID
- `your-app-store-connect-app-id` → App Store Connect App ID
- `YOUR_TEAM_ID` → Apple Developer Team ID

---

## Build Profiles

### Development Build (for testing)
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android APK
eas build --profile development --platform android
```

### Preview Build (for testers)
```bash
# Internal distribution
eas build --profile preview --platform all
```

### Production Build (for stores)
```bash
# iOS App Store + Android Play Store
eas build --profile production --platform all
```

---

## iOS Deployment

### 1. Apple Developer Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Create App ID: `com.murranno.music`
3. Create Push Notification certificate
4. Create App Store Connect app

### 2. Credentials

EAS handles credentials automatically:
```bash
# Let EAS manage credentials (recommended)
eas credentials

# Or manage manually
eas credentials --platform ios
```

### 3. Build & Submit

```bash
# Build for App Store
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

### 4. TestFlight

After submission:
1. Go to App Store Connect
2. Select your app → TestFlight
3. Add internal/external testers
4. Submit for review if external

---

## Android Deployment

### 1. Google Play Setup

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Complete store listing
4. Set up internal testing track

### 2. Service Account

1. Google Cloud Console → Create Service Account
2. Grant "Service Account User" role
3. Create JSON key
4. Save as `google-play-service-account.json`
5. In Play Console → API access → Link service account

### 3. Build & Submit

```bash
# Build AAB for Play Store
eas build --profile production --platform android

# Submit to Google Play
eas submit --platform android
```

---

## Over-the-Air Updates

### Setup

```bash
# Configure update channel
eas update:configure
```

### Publish Updates

```bash
# Push update to preview channel
eas update --branch preview --message "Bug fixes"

# Push update to production
eas update --branch production --message "v1.0.1 - Performance improvements"
```

### Update Strategies

| Strategy | Use Case |
|----------|----------|
| `fingerprint` | Only update if JS bundle changes |
| `appVersion` | Tie updates to app version |
| `runtimeVersion` | Custom version string |

---

## Environment Variables

### Secrets (sensitive data)
```bash
# Add secrets via EAS CLI
eas secret:create --name SUPABASE_URL --value "https://..."
eas secret:create --name SUPABASE_ANON_KEY --value "eyJ..."
```

### Build-time Variables
Set in `eas.json` under `env`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.murranno.com"
      }
    }
  }
}
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      platform:
        type: choice
        options: [all, ios, android]
      profile:
        type: choice
        options: [development, preview, production]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build
        run: |
          eas build \
            --profile ${{ inputs.profile || 'preview' }} \
            --platform ${{ inputs.platform || 'all' }} \
            --non-interactive
```

---

## Monitoring & Analytics

### Sentry Integration

```bash
npx expo install @sentry/react-native
```

```typescript
// App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.EXPO_PUBLIC_ENV,
});
```

### EAS Insights

View build metrics and crash reports at:
- [expo.dev/accounts/[owner]/projects/murranno-music/insights](https://expo.dev)

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails on iOS | Check provisioning profiles: `eas credentials` |
| Android signing error | Regenerate keystore: `eas credentials --platform android` |
| Update not appearing | Check channel matches: `eas update:list` |
| OTA update crash | Verify runtime version compatibility |

### Debug Commands

```bash
# View build logs
eas build:list

# Check credentials
eas credentials

# View update history
eas update:list

# Check project config
eas config
```

---

## Checklist Before Release

### iOS
- [ ] App icons (1024x1024)
- [ ] Screenshots (6.5", 5.5", iPad)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Keywords
- [ ] Support URL

### Android
- [ ] App icons (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone, tablet)
- [ ] Privacy policy
- [ ] Short/full descriptions
- [ ] Content rating questionnaire

---

## Version Management

```bash
# Bump version before release
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# EAS auto-increments build numbers with autoIncrement: true
```

# Deep Linking Configuration Guide

Complete setup guide for iOS Universal Links, Android App Links, and custom URL schemes for Murranno Music.

## Overview

| Type | Scheme | Example | Server Required |
|------|--------|---------|-----------------|
| Custom Scheme | `murranno://` | `murranno://release/123` | ❌ No |
| Universal Links (iOS) | `https://` | `https://murranno.com/release/123` | ✅ Yes |
| App Links (Android) | `https://` | `https://murranno.com/release/123` | ✅ Yes |

---

## Supported Routes

| URL Pattern | Screen | Auth Required |
|-------------|--------|---------------|
| `murranno://release/:id` | Release Detail | ✅ Yes |
| `murranno://artist/:id` | Artist Profile | ✅ Yes |
| `murranno://campaign/:id` | Campaign Tracking | ✅ Yes |
| `murranno://upload` | Upload Screen | ✅ Yes |
| `murranno://earnings` | Earnings Overview | ✅ Yes |
| `murranno://wallet` | Wallet Screen | ✅ Yes |
| `murranno://settings` | Settings | ✅ Yes |
| `murranno://profile` | Profile | ✅ Yes |
| `murranno://notifications` | Notifications | ✅ Yes |
| `murranno://promotions` | Promotions List | ✅ Yes |
| `murranno://promotions/:id` | Promotion Detail | ✅ Yes |
| `murranno://reset-password` | Reset Password | ❌ No |
| `murranno://verify-email` | Verify Email | ❌ No |
| `murranno://callback` | OAuth Callback | ❌ No |
| `murranno://welcome` | Welcome Screen | ❌ No |

---

## Part 1: Custom URL Scheme (murranno://)

### Configuration

Already configured in `app.config.ts`:

```typescript
scheme: 'murranno',
```

### Testing

```bash
# iOS Simulator
xcrun simctl openurl booted "murranno://release/123"

# Android Emulator
adb shell am start -a android.intent.action.VIEW -d "murranno://release/123"

# Expo Go
npx uri-scheme open "murranno://release/123" --ios
npx uri-scheme open "murranno://release/123" --android
```

---

## Part 2: iOS Universal Links

### Step 1: Create Apple App Site Association (AASA) File

Host this file at `https://murranno.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": [
          "TEAM_ID.com.murranno.music"
        ],
        "components": [
          { "/": "/release/*", "comment": "Release details" },
          { "/": "/artist/*", "comment": "Artist profiles" },
          { "/": "/campaign/*", "comment": "Campaign tracking" },
          { "/": "/promotions/*", "comment": "Promotion details" },
          { "/": "/upload", "comment": "Upload screen" },
          { "/": "/earnings", "comment": "Earnings" },
          { "/": "/wallet", "comment": "Wallet" },
          { "/": "/settings", "comment": "Settings" },
          { "/": "/profile", "comment": "Profile" },
          { "/": "/reset-password", "comment": "Password reset" },
          { "/": "/verify-email", "comment": "Email verification" },
          { "/": "/callback", "comment": "OAuth callback" }
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "TEAM_ID.com.murranno.music"
    ]
  }
}
```

### Step 2: Configure Associated Domains

Update `app.config.ts`:

```typescript
ios: {
  bundleIdentifier: 'com.murranno.music',
  associatedDomains: [
    'applinks:murranno.com',
    'applinks:www.murranno.com',
    'webcredentials:murranno.com',
  ],
  // ... other config
},
```

### Step 3: Server Requirements

1. **HTTPS Required**: The AASA file must be served over HTTPS
2. **Content-Type**: Must be `application/json`
3. **No Redirects**: The file must be served directly (no redirects)
4. **Root Path**: Must be at `/.well-known/apple-app-site-association`

### Step 4: Validate Configuration

Use Apple's validator:
```
https://search.developer.apple.com/appsearch-validation-tool/
```

---

## Part 3: Android App Links

### Step 1: Create Digital Asset Links File

Host at `https://murranno.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.murranno.music",
      "sha256_cert_fingerprints": [
        "SHA256_FINGERPRINT_DEBUG",
        "SHA256_FINGERPRINT_RELEASE"
      ]
    }
  }
]
```

### Step 2: Get SHA256 Fingerprints

**Debug keystore:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Release keystore (from EAS):**
```bash
eas credentials --platform android
```

Or from Google Play Console:
- Go to Release > Setup > App signing
- Copy the SHA-256 certificate fingerprint

### Step 3: Configure Intent Filters

Update `app.config.ts`:

```typescript
android: {
  package: 'com.murranno.music',
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [
        {
          scheme: 'https',
          host: 'murranno.com',
          pathPrefix: '/',
        },
        {
          scheme: 'https',
          host: 'www.murranno.com',
          pathPrefix: '/',
        },
      ],
      category: ['BROWSABLE', 'DEFAULT'],
    },
  ],
  // ... other config
},
```

### Step 4: Validate Configuration

Use Google's validator:
```
https://developers.google.com/digital-asset-links/tools/generator
```

---

## Part 4: Implementation

### DeepLinkingService

The `DeepLinkingService` handles URL parsing and route matching:

```typescript
import { DeepLinkingService } from './services/DeepLinkingService';

// Parse a URL
const result = DeepLinkingService.parseUrl('murranno://release/123');
// { screen: 'ReleaseDetail', params: { id: '123' }, requiresAuth: true }

// Check if URL is valid
const isValid = DeepLinkingService.isValidDeepLink('murranno://release/123');
// true
```

### useDeepLinking Hook

The `useDeepLinking` hook manages deep link handling with authentication:

```typescript
import { useDeepLinking } from './hooks/useDeepLinking';

function App() {
  useDeepLinking(); // Automatically handles deep links
  return <RootNavigator />;
}
```

### Deferred Deep Links

For links that require authentication:

1. Link is received while user is not authenticated
2. Link is stored in secure storage
3. After successful login, user is navigated to the stored destination

---

## Part 5: OAuth Callback Handling

The app handles OAuth callbacks from social providers:

```typescript
// URL format: murranno://callback#access_token=xxx&refresh_token=xxx

// The useDeepLinking hook automatically:
// 1. Detects callback URLs
// 2. Extracts tokens from URL fragment
// 3. Establishes Supabase session
// 4. Navigates to dashboard
```

---

## Part 6: Testing Guide

### Local Testing

```bash
# Test custom scheme
npx uri-scheme open "murranno://release/123" --ios

# Test with Expo development client
expo start --dev-client
```

### Production Testing

1. **iOS**: Tap a link in Messages or Notes
2. **Android**: Tap a link in an email or message app
3. **QR Code**: Scan a QR code with the deep link

### Debug Logging

```typescript
import { getDeepLinkLog } from './hooks/useDeepLinking';

// View deep link event history
console.log(getDeepLinkLog());
```

---

## Part 7: Server Configuration

### Nginx Configuration

```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
}

location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Content-Type application/json;
}
```

### Vercel Configuration (vercel.json)

```json
{
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [
        { "key": "Content-Type", "value": "application/json" }
      ]
    },
    {
      "source": "/.well-known/assetlinks.json",
      "headers": [
        { "key": "Content-Type", "value": "application/json" }
      ]
    }
  ]
}
```

---

## Part 8: Troubleshooting

### iOS Issues

1. **Links opening in Safari instead of app**
   - Verify AASA file is valid JSON
   - Check Team ID matches exactly
   - Ensure no redirects to AASA file
   - Wait 24-48 hours for Apple CDN cache

2. **AASA not being fetched**
   - Check HTTPS certificate validity
   - Verify file is at correct path
   - Test with `curl -I https://domain.com/.well-known/apple-app-site-association`

### Android Issues

1. **App not verified**
   - Check SHA256 fingerprints match
   - Verify package name exactly
   - Use Google's Digital Asset Links validator

2. **Links showing disambiguation dialog**
   - Add all domain variants (www, non-www)
   - Ensure `autoVerify: true` is set

### General Issues

1. **Deep link not handled**
   - Check if route is defined in config
   - Verify URL format matches pattern
   - Check authentication state

2. **Deferred deep link lost**
   - Verify SecureStore is working
   - Check for storage quota issues

---

## Quick Reference

### URL Patterns

```
murranno://release/abc123          → Release Detail
murranno://artist/xyz789           → Artist Profile
murranno://campaign/camp456        → Campaign Tracking
murranno://promotions/promo123     → Promotion Detail
murranno://upload                  → Upload Screen
murranno://earnings                → Earnings Overview
murranno://wallet                  → Wallet Screen
murranno://settings                → Settings
murranno://profile                 → Profile
murranno://notifications           → Notifications
murranno://reset-password?token=x  → Reset Password
murranno://verify-email?token=x    → Verify Email
murranno://callback#access_token=x → OAuth Callback
```

### HTTPS Equivalents

All `murranno://` URLs work with `https://murranno.com/` prefix:

```
https://murranno.com/release/abc123 → Same as murranno://release/abc123
```

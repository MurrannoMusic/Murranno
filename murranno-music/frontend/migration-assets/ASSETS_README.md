# Migration Assets

This folder contains all the image assets needed for the React Native app.

## Assets Included

| File | Description | Usage |
|------|-------------|-------|
| `mm_logo.png` | Murranno Music logo | App header, splash screen, login screens |
| `musician-background.jpg` | Background image | Auth screens background |
| `favicon.png` | App icon (source) | Convert to app icons using EAS |
| `carousel-1.jpg` | Welcome carousel image 1 | WelcomeScreen onboarding |
| `carousel-2.jpg` | Welcome carousel image 2 | WelcomeScreen onboarding |
| `carousel-3.jpg` | Welcome carousel image 3 | WelcomeScreen onboarding |

## How to Use

### 1. Copy to Your Expo Project

```bash
# From your new Expo project root
cp -r migration-assets/assets ./assets
```

### 2. Import in Components

```tsx
// Using require (recommended for static assets)
const logo = require('../assets/mm_logo.png');

// In Image component
<Image source={require('../assets/mm_logo.png')} />
```

### 3. Generate App Icons

Use EAS to generate app icons from `favicon.png`:

```bash
# In your Expo project
npx expo install expo-image

# Update app.json to reference the icon
{
  "expo": {
    "icon": "./assets/favicon.png"
  }
}
```

## Replacing with Custom Branding

To use your own branding:

1. Replace files with your own images (keep the same filenames)
2. Or update the imports in the screen files to use your custom filenames

### Recommended Image Sizes

| Asset | Recommended Size |
|-------|-----------------|
| `mm_logo.png` | 512x512 (PNG with transparency) |
| `favicon.png` | 1024x1024 (PNG, will be auto-resized) |
| `carousel-*.jpg` | 750x1334 or similar mobile aspect ratio |
| `musician-background.jpg` | 1080x1920 (portrait orientation) |

## Notes

- All images are optimized for mobile
- Carousel images should be portrait orientation for best display
- The favicon will be used to generate all app icon sizes automatically by Expo/EAS

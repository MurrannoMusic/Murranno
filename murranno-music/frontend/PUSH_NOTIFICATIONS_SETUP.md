# Push Notifications Setup Guide

This guide will help you set up push notifications for iOS and Android using Capacitor.

## Prerequisites

- Node.js and npm installed
- Xcode (for iOS development)
- Android Studio (for Android development)
- Firebase project (for push notifications)

## Step 1: Firebase Setup

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Add both iOS and Android apps to your Firebase project

### 2. Configure iOS (APNs)
1. In Firebase Console, go to Project Settings → Cloud Messaging
2. Under iOS app configuration, upload your APNs authentication key or certificate
3. Download the `GoogleService-Info.plist` file

### 3. Configure Android (FCM)
1. In Firebase Console, go to Project Settings → Cloud Messaging
2. Download the `google-services.json` file
3. Note your Server Key (for backend push notification sending)

## Step 2: Install Dependencies

```bash
npm install @capacitor/push-notifications
npx cap sync
```

## Step 3: iOS Configuration

### Add GoogleService-Info.plist
1. Transfer your project to GitHub and clone it locally
2. Copy `GoogleService-Info.plist` to `ios/App/App/` directory
3. Open the project in Xcode: `npx cap open ios`
4. Add the file to your project in Xcode (right-click App folder → Add Files to "App")

### Enable Push Notifications Capability
1. In Xcode, select your app target
2. Go to "Signing & Capabilities" tab
3. Click "+ Capability" and add "Push Notifications"
4. Add "Background Modes" capability and enable "Remote notifications"

### Update Info.plist
Add the following to `ios/App/App/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## Step 4: Android Configuration

### Add google-services.json
1. Copy `google-services.json` to `android/app/` directory

### Update build.gradle files

**android/build.gradle:**
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

**android/app/build.gradle:**
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.1.2'
}
```

### Update AndroidManifest.xml
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

## Step 5: Backend Configuration

### Store Firebase Server Key
The Firebase Server Key (or service account credentials) is needed to send push notifications from your backend.

1. Get your FCM Server Key from Firebase Console → Project Settings → Cloud Messaging
2. Store it as a Supabase secret named `FCM_SERVER_KEY`

### Implement Push Sending Logic

Update the `send-notification` edge function to actually send push notifications:

```typescript
// Example FCM implementation
async function sendFCMNotification(token: string, payload: any) {
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY');
  
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      notification: {
        title: payload.title,
        body: payload.message,
      },
      data: {
        type: payload.type,
      },
      priority: 'high',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`FCM error: ${await response.text()}`);
  }
  
  return await response.json();
}
```

## Step 6: Testing

### Test on iOS
1. Build and run on a physical device (push notifications don't work on simulator)
```bash
npx cap run ios
```
2. Accept the push notification permission prompt
3. Send a test notification from your admin panel

### Test on Android
1. Build and run on a device or emulator
```bash
npx cap run android
```
2. Accept the push notification permission prompt
3. Send a test notification from your admin panel

## Step 7: Sync After Changes

After making any changes to native code or configuration:

```bash
npx cap sync
```

## Troubleshooting

### iOS Issues
- **Notifications not appearing**: Check that push notifications capability is enabled in Xcode
- **Token not registering**: Verify GoogleService-Info.plist is properly added
- **Permission denied**: Make sure you're testing on a physical device

### Android Issues
- **Build errors**: Ensure google-services.json is in the correct location
- **Notifications not showing**: Check that POST_NOTIFICATIONS permission is granted
- **Token registration fails**: Verify Firebase project configuration

## Important Notes

1. **Push notifications require physical devices** - they won't work on iOS simulator
2. **Permissions are required** - users must grant notification permissions
3. **Background delivery** - notifications can be received when app is in background
4. **Token management** - tokens are automatically registered when users open the app

## Security Considerations

- Never expose Firebase credentials in client code
- Store FCM Server Key securely in Supabase secrets
- Validate notification recipients on the backend
- Implement rate limiting for push notifications
- Allow users to opt-out via notification preferences

## Next Steps

1. Implement actual FCM/APNs sending in the backend
2. Add notification action handlers
3. Test on both iOS and Android devices
4. Monitor delivery rates and errors
5. Implement rich notifications with images/actions

For more information, see:
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Blog Post](https://ionic.io/blog/capacitor-everything-youve-ever-wanted-to-know)

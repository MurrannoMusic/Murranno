# Android Setup Guide for Murranno Music

This guide covers all the necessary Android configurations for the Capacitor plugins used in this project.

## Prerequisites

- Android Studio (latest stable version)
- JDK 17 or higher
- Android SDK with API 33 (Android 13) or higher
- A physical Android device or emulator for testing

## Initial Setup

1. **Export and Clone Project**
   ```bash
   # Export project to GitHub, then clone locally
   git clone <your-repo-url>
   cd murranno-music
   npm install
   ```

2. **Add Android Platform**
   ```bash
   npx cap add android
   ```

3. **Build Web Assets**
   ```bash
   npm run build
   ```

4. **Sync with Native Project**
   ```bash
   npx cap sync android
   ```

## AndroidManifest.xml Configuration

Location: `android/app/src/main/AndroidManifest.xml`

Add the following permissions inside the `<manifest>` tag:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Internet & Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- Camera -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    
    <!-- Location (Geolocation) -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    
    <!-- File Storage (Filesystem, Camera) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" 
                     android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                     android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    
    <!-- Push Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <!-- Local Notifications -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    
    <!-- Audio Playback (Native Audio) -->
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <!-- Biometric Authentication -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Deep Link for OAuth Callbacks -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="murranno" android:host="callback" />
            </intent-filter>
        </activity>
        
        <!-- Push Notifications Receiver -->
        <receiver 
            android:name="com.google.firebase.iid.FirebaseInstanceIdReceiver"
            android:exported="true"
            android:permission="com.google.android.c2dm.permission.SEND">
            <intent-filter>
                <action android:name="com.google.android.c2dm.intent.RECEIVE" />
            </intent-filter>
        </receiver>
    </application>
</manifest>
```

## build.gradle Configuration

### Project-level build.gradle

Location: `android/build.gradle`

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

### App-level build.gradle

Location: `android/app/build.gradle`

Add/modify the following:

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'

android {
    namespace "app.lovable.c3daad8632214cd78f32217f9f05ec3c"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "app.lovable.c3daad8632214cd78f32217f9f05ec3c"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    
    // Capacitor
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-browser')
    implementation project(':capacitor-camera')
    implementation project(':capacitor-clipboard')
    implementation project(':capacitor-device')
    implementation project(':capacitor-filesystem')
    implementation project(':capacitor-geolocation')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-local-notifications')
    implementation project(':capacitor-network')
    implementation project(':capacitor-push-notifications')
    implementation project(':capacitor-screen-orientation')
    implementation project(':capacitor-share')
    implementation project(':capacitor-status-bar')
    
    // Firebase for Push Notifications
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
    
    // AndroidX
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.biometric:biometric:1.2.0-alpha05'
    
    // Play Services
    implementation 'com.google.android.gms:play-services-location:21.0.1'
}
```

## Firebase Setup for Push Notifications

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Add an Android app with package name: `app.lovable.c3daad8632214cd78f32217f9f05ec3c`

2. **Download google-services.json**
   - Download the `google-services.json` file from Firebase Console
   - Place it in: `android/app/google-services.json`

3. **Configure FCM**
   - In Firebase Console, go to Project Settings → Cloud Messaging
   - Copy the Server Key
   - Add it as a secret in your Lovable project (Settings → Secrets → Add Secret)
   - Name: `FCM_SERVER_KEY`

## Variable Configuration

### gradle.properties

Location: `android/gradle.properties`

```properties
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false
```

## strings.xml Configuration

Location: `android/app/src/main/res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Murranno Music</string>
    <string name="title_activity_main">Murranno Music</string>
    <string name="package_name">app.lovable.c3daad8632214cd78f32217f9f05ec3c</string>
    <string name="custom_url_scheme">murranno</string>
</resources>
```

## Testing Permissions at Runtime

Many of these permissions require runtime requests (Android 6.0+). The Capacitor plugins handle this automatically, but you can test:

```typescript
// Camera permission is auto-requested when using useCamera hook
const { takePicture } = useCamera();

// Location permission is auto-requested when using useGeolocation hook
const { getCurrentPosition } = useGeolocation();

// Notification permission (Android 13+)
const { requestPermissions } = usePushNotifications();
```

## Build and Run

1. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

2. **Build the Project**
   - In Android Studio: Build → Make Project
   - Or via command line: `./gradlew build`

3. **Run on Device/Emulator**
   ```bash
   npx cap run android
   ```
   Or use Android Studio's Run button

## Hot Reload Development

For hot reload during development:

1. Make sure `capacitor.config.ts` has the server URL configured:
   ```typescript
   server: {
     url: "https://c3daad86-3221-4cd7-8f32-217f9f05ec3c.lovableproject.com?forceHideBadge=true",
     cleartext: true
   }
   ```

2. Run the app on device/emulator
3. Make changes in Lovable - they'll reflect instantly

## Troubleshooting

### Build Errors

**"Duplicate class found"**
- Clean build: `cd android && ./gradlew clean && cd ..`
- Sync: `npx cap sync android`

**"SDK location not found"**
- Create `local.properties` in `android/` folder:
  ```properties
  sdk.dir=/path/to/Android/sdk
  ```

**"Google Services Plugin Missing"**
- Make sure `google-services.json` is in `android/app/`
- Verify `com.google.gms:google-services` classpath in project build.gradle

### Permission Issues

**Camera not working**
- Verify camera permissions in AndroidManifest.xml
- Test on physical device (emulator cameras can be unreliable)

**Location not working**
- Enable location services on device
- Grant location permissions in app settings
- Check GPS is enabled

**Push notifications not received**
- Verify `google-services.json` is configured correctly
- Check FCM Server Key is set in Lovable secrets
- Test on physical device (emulators need Google Play Services)

### Plugin Errors

**Plugin not found**
- Run `npx cap sync android`
- Clean and rebuild in Android Studio

**Native code changed but not updating**
- Uninstall app from device
- Clean build: `./gradlew clean`
- Rebuild and reinstall

## Production Build

For release builds:

1. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore murranno-release.keystore -alias murranno -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing in build.gradle**
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('murranno-release.keystore')
               storePassword 'your-password'
               keyAlias 'murranno'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK/AAB**
   ```bash
   cd android
   ./gradlew assembleRelease  # For APK
   ./gradlew bundleRelease    # For AAB (Google Play)
   ```

## Next Steps

- Test all native features on a physical device
- Set up CI/CD for automated builds
- Configure ProGuard rules if needed
- Submit to Google Play Store

## Resources

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/android/client)

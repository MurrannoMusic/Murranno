import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.murrannomusic.app',
  appName: 'murranno music',
  webDir: 'dist',
  plugins: {
    // PushNotifications disabled temporarily - requires Firebase setup
    // PushNotifications: {
    //   presentationOptions: ["badge", "sound", "alert"]
    // },
    App: {
      appUrlOpen: {
        enabled: true
      }
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#09090b",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Enable faster HTTP requests if needed
    CapacitorHttp: {
      enabled: true,
    },
  },
  // Ensure background matches app theme to prevent white flashes
  backgroundColor: '#09090b',
};

export default config;

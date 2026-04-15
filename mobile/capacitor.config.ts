import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.swipego.focusracer',
  appName: 'Focus Racer',
  webDir: 'www',

  // Load the remote web app
  server: {
    url: 'https://focusracer.swipego.app',
    cleartext: false,
    // Allow navigation to Stripe, Cloudflare, AWS
    allowNavigation: [
      'focusracer.swipego.app',
      'js.stripe.com',
      'challenges.cloudflare.com',
      '*.amazonaws.com',
    ],
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#042F2E',
      showSpinner: true,
      spinnerColor: '#10B981',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#042F2E',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },

  android: {
    backgroundColor: '#042F2E',
    allowMixedContent: false,
    overScrollMode: 'never',
    // WebView settings for optimal performance
    webContentsDebuggingEnabled: false,
  },
};

export default config;

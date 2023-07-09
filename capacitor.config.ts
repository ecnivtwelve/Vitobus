import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vincelinise.vitobus',
  appName: 'Vitobus',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true,
      iosSpinnerStyle: 'small',
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      backgroundColor: '#1E3643',
    },
  },
};

export default config;

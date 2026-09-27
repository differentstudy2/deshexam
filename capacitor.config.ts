import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deshexam.app',
  appName: 'DeshExam',
  webDir: 'public',
  server: {
    url: 'https://deshexam.com',
    cleartext: true
  }
};

export default config;

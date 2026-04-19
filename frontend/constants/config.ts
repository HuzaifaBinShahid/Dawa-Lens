import { Platform } from 'react-native';

const envUrl = process.env.EXPO_PUBLIC_API_URL;

const defaultUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  default: 'http://localhost:3000',
});

export const Config = {
  apiBaseUrl: envUrl && envUrl.trim().length > 0 ? envUrl : (defaultUrl as string),
  requestTimeoutMs: 8000,
};

# DawaLens Frontend

Expo + React Native app for DawaLens.

## Requires a dev build (not Expo Go)

This project uses `@react-native-ml-kit/text-recognition` for on-device OCR, which is a native module. **It will NOT work in Expo Go.** You must create a development build.

### First-time setup (once)

```bash
npm install
npx expo prebuild            # generates android/ + ios/ folders
npx expo run:android         # needs Android Studio + device/emulator
# (or for iOS on macOS: npx expo run:ios)
```

After the dev build is installed on your device, day-to-day development only needs:

```bash
npx expo start --dev-client
```

### Using EAS Build instead (no local Android Studio required)

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

Install the resulting `.apk` on your phone, then run `npx expo start --dev-client`.

## Backend URL configuration

Create `.env` in `frontend/`:

```
EXPO_PUBLIC_API_URL=http://<your-machine-lan-ip>:3000
```

- **Android emulator**: `http://10.0.2.2:3000` (default, no env needed).
- **iOS simulator**: `http://localhost:3000` (default, no env needed).
- **Physical device on Wi-Fi**: use your machine's LAN IP, e.g. `http://192.168.1.10:3000`. Make sure the backend is reachable on that port.

## Scripts

- `npm start` — start Metro
- `npm run android` — build + run on Android
- `npm run ios` — build + run on iOS (macOS only)

## Architecture

- `app/` — Expo Router routes
- `components/` — reusable UI
- `services/api.ts` — API client (fetch wrapper, 8s timeout)
- `services/ocr.ts` — ML Kit OCR wrapper + candidate extraction
- `hooks/` — data fetching + animation hooks
- `constants/` — colors, theme, config
- `types/` — shared TypeScript types

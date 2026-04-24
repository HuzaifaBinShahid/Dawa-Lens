# DawaLens

**Intelligent medicine identification for the Pakistani market.** Scan a pill box or type a brand name and DawaLens returns structured, trustworthy information — dosage, contraindications, side effects, alternatives — built around how Pakistani pharmacies actually stock medicine.

---

## Overview

Most Pakistanis know a medicine by its **brand** (Panadol, Brufen, Disprin) but every medicine's clinical profile is organised around its **salt / composition** (paracetamol, ibuprofen, aspirin). DawaLens bridges that gap with two complementary entry points — an on-device OCR scanner that reads packaging, and a salt-aware search that understands both brand and generic queries — then surfaces information in plain, scannable language optimised for everyday users and caregivers.

## Features

- **Module 01 — Scan**: On-device text recognition via ML Kit. Point the camera at a medicine box, extracted text is matched against the salt index, and a peek card slides up with the matched brand, its salt, and sibling brands.
- **Module 02 — Search**: Debounced two-pass lookup with typo-tolerant fallback. Results always lead with the **brand name** (big), show the underlying salt, and list up to three related brands that contain the same active ingredient.
- **Medicine detail**: Tabbed layout — Overview / Dosage / Warnings / Special Use / Products — replaces a long-scroll page. A persistent safety-alert card opens a custom bottom-sheet modal instead of the native OS dialog.
- **Device-based identity**: No sign-up, no login. A UUID is generated on first launch and stored locally; scan and search history, plus saved medicines, are keyed to that ID on the backend.
- **History + Saved**: Every scan match and search selection is logged. Users can bookmark any medicine from its detail page and filter the History tab by Scans / Searches / Saved.
- **Bilingual**: English and Urdu with RTL layout support. Theme preference (Light / Dark) and locale persist across launches.
- **Animated splash**: Cinematic capsule-break intro with row-wise screen split, wordmark reveal, floating medicine iconography, and a scanner sweep — all hand-built with Reanimated.

## Tech Stack

**Frontend** (`frontend/`)
- React Native 0.81 with the new architecture (Fabric)
- Expo SDK 54 (bare workflow via dev client)
- Expo Router for file-based navigation
- Reanimated + Worklets for motion
- `@react-native-ml-kit/text-recognition` for on-device OCR
- `expo-file-system` for local persistence (recent searches, device id, preferences)
- TypeScript end to end

**Backend** (`backend/`)
- Node.js + Express
- MongoDB via Mongoose
- Tiered search: exact match → case-insensitive prefix → weighted full-text fallback
- Device-context middleware (`X-Device-Id` header)

## Repository Structure

```
.
├── backend/          Express + Mongoose API (medicines, devices, history, saved)
├── frontend/         React Native + Expo mobile app
└── .gitignore
```

The marketing landing page lives in its own repository and is intentionally excluded from this one.

## Prerequisites

- Node.js **18 LTS or newer**
- A MongoDB instance (local, Atlas, or any hosted provider)
- For mobile development:
  - **Android Studio** with an emulator image, or an Android device with USB debugging enabled
  - JDK 17
  - Android SDK Platform 34 + Build-Tools
- (iOS is not currently supported end-to-end — the ML Kit text recognition module is Android-tested)

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then edit MONGODB_URI, PORT, DB_COLLECTION
npm run dev                # or: npm start
```

Expected startup log:
```
Server running on http://localhost:3000
```

Smoke test:
```bash
curl http://localhost:3000/health
# => {"status":"ok","message":"Medicines API is running"}
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```
Use your machine's LAN IP so the phone can reach the backend over Wi-Fi. If you run against an emulator you can use `http://10.0.2.2:3000`, or forward with `adb reverse tcp:3000 tcp:3000` and use `http://localhost:3000`.

#### First-time native build (once per machine)

```bash
npx expo run:android          # produces the dev-client APK and installs it
```

This compiles the native modules (ML Kit, Reanimated, etc.) and installs the dev client on your connected device/emulator. First build takes 5–15 minutes; subsequent rebuilds only happen when you add a new native module.

#### Day-to-day development

```bash
npm run start                 # starts Metro with --dev-client
```

Then open the **DawaLens** app on your device/emulator. It connects to Metro and hot-reloads on save.

> Do **not** use `expo start` without `--dev-client` — it will try to install Expo Go, which cannot load the ML Kit native module.

If you're plugging in a physical Android device:

```bash
adb reverse tcp:8081 tcp:8081    # Metro
adb reverse tcp:3000 tcp:3000    # backend (optional, if not on Wi-Fi)
```

## Environment Variables

**Backend** (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | Full Mongo connection string |
| `PORT` | no | HTTP port (default `3000`) |
| `DB_COLLECTION` | no | Medicines collection name (default `medicines`) |

**Frontend** (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | yes | Base URL the app uses to reach the backend |

## API Reference

Every request (except `/health`) is expected to include an `X-Device-Id` header. Missing is tolerated but history and saved endpoints return empty arrays in that case.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/medicines` | List / prefix-search medicines |
| `GET` | `/api/medicines/search?q=&limit=` | Tiered salt + brand search |
| `GET` | `/api/medicines/:id` | Single medicine by id |
| `POST` | `/api/devices/register` | Upsert device record |
| `POST` | `/api/history` | Log a scan or search event |
| `GET` | `/api/history?limit=&type=` | List this device's history |
| `POST` | `/api/saved` | Save a medicine |
| `DELETE` | `/api/saved/:medicineId` | Remove a saved medicine |
| `GET` | `/api/saved` | List saved medicines |

## Project Conventions

- **Brand-first display**: search and scan results always lead with the medicine's trade name; the salt is shown as secondary context. If the query maps to a salt directly, the first product brand becomes the primary line.
- **No authentication in v1**: identity is purely device-scoped. Uninstall = history lost. A recovery-code flow is a planned enhancement.
- **Design language**: Editorial Clinical — blue (`#0160B8`) as the primary, orange (`#EA580C`) reserved for punctuation and accents, dark ink (`#1A1A2E`) on the scan surface. See `frontend/constants/colors.ts` and `frontend/constants/palettes.ts`.

## Troubleshooting

- **Blank screen on the emulator** — almost always a GPU composition bug on certain Pixel AVDs with Fabric. Cold-boot the emulator (Device Manager → ⋮ → Wipe Data) or switch the AVD's graphics mode to `Software - GLES 2.0`.
- **`INSTALL_FAILED_INSUFFICIENT_STORAGE`** — the emulator's `/data` partition is full. Remove unused apps (`adb shell pm uninstall --user 0 <package>`) to free space, then reinstall.
- **`INSTALL_FAILED_USER_RESTRICTED` on Xiaomi/MIUI** — enable **Install via USB** under Developer Options; MIUI requires this in addition to USB debugging.
- **`Could not resolve project :react-native-xxx`** after pulling new native deps — regenerate the native project: `npx expo prebuild --clean --platform android` then rebuild.

## License

Proprietary. All rights reserved.

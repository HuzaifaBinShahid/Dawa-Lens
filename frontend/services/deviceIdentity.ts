import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'device-identity.json';

type DeviceIdentity = {
  deviceId: string;
  createdAt: number;
};

export type DeviceInfo = {
  deviceId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  model: string | null;
};

let cachedId: string | null = null;
let cachedInfo: DeviceInfo | null = null;

const getFile = () => new File(Paths.document, FILE_NAME);

const generateUuid = (): string => {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4';
    } else if (i === 19) {
      out += hex[(Math.random() * 4) | 8];
    } else {
      out += hex[(Math.random() * 16) | 0];
    }
  }
  return out;
};

const readStored = (): DeviceIdentity | null => {
  try {
    const file = getFile();
    if (!file.exists) return null;
    const raw = file.textSync();
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.deviceId !== 'string') return null;
    return parsed as DeviceIdentity;
  } catch {
    return null;
  }
};

const writeStored = (identity: DeviceIdentity) => {
  try {
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(identity));
  } catch {
    // storage write failure is non-critical; keep in-memory id
  }
};

export const getDeviceId = (): string => {
  if (cachedId) return cachedId;
  const stored = readStored();
  if (stored) {
    cachedId = stored.deviceId;
    return cachedId;
  }
  const next: DeviceIdentity = {
    deviceId: generateUuid(),
    createdAt: Date.now(),
  };
  writeStored(next);
  cachedId = next.deviceId;
  return cachedId;
};

export const getDeviceInfo = (): DeviceInfo => {
  if (cachedInfo) return cachedInfo;
  const expoConfig = Constants.expoConfig || (Constants as any).manifest || {};
  cachedInfo = {
    deviceId: getDeviceId(),
    platform: Platform.OS,
    osVersion: String(Platform.Version),
    appVersion: (expoConfig && expoConfig.version) || '0.0.0',
    model: (Constants as any).deviceName || null,
  };
  return cachedInfo;
};

let registerPromise: Promise<void> | null = null;

export const ensureRegistered = async (
  postRegister: (info: DeviceInfo) => Promise<void>
): Promise<void> => {
  if (registerPromise) return registerPromise;
  registerPromise = (async () => {
    try {
      await postRegister(getDeviceInfo());
    } catch {
      // Non-blocking — if offline at first launch we'll re-register on next boot
      registerPromise = null;
    }
  })();
  return registerPromise;
};

export const clearDeviceIdentity = () => {
  try {
    const file = getFile();
    if (file.exists) file.delete();
  } catch {}
  cachedId = null;
  cachedInfo = null;
  registerPromise = null;
};

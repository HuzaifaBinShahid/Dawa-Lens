import Constants from 'expo-constants';
import type { Tracker } from '@/types/tracker';

type NotificationsModule = any;

let cachedModule: NotificationsModule | null = null;
let attempted = false;

// expo-notifications was removed from Expo Go in SDK 53+. Calling require on it
// inside Expo Go logs a red error and only partially works. Detect Expo Go and
// skip loading entirely — notifications only run in a dev/production build.
const isExpoGo = Constants.appOwnership === 'expo';

const tryLoadModule = (): NotificationsModule | null => {
  if (cachedModule) return cachedModule;
  if (attempted || isExpoGo) return null;
  attempted = true;
  try {
    cachedModule = require('expo-notifications');
    return cachedModule;
  } catch {
    return null;
  }
};

export const isAvailable = (): boolean => !!tryLoadModule();

export const requestPermissions = async (): Promise<boolean> => {
  const Notifications = tryLoadModule();
  if (!Notifications) return false;
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
};

export const setupAndroidChannel = async (): Promise<void> => {
  const Notifications = tryLoadModule();
  if (!Notifications) return;
  try {
    const { Platform } = require('react-native');
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('dawalens-reminders', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance?.HIGH ?? 4,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#005FB8',
    });
  } catch {}
};

const FILE_NAME = 'tracker-notifications.json';

const loadMap = (): Record<string, string[]> => {
  try {
    const { File, Paths } = require('expo-file-system');
    const file = new File(Paths.document, FILE_NAME);
    if (!file.exists) return {};
    const raw = file.textSync();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const saveMap = (map: Record<string, string[]>): void => {
  try {
    const { File, Paths } = require('expo-file-system');
    const file = new File(Paths.document, FILE_NAME);
    if (!file.exists) file.create();
    file.write(JSON.stringify(map));
  } catch {}
};

export const scheduleForTracker = async (tracker: Tracker): Promise<string[]> => {
  const Notifications = tryLoadModule();
  if (!Notifications) return [];
  try {
    await setupAndroidChannel();
    const granted = await requestPermissions();
    if (!granted) return [];

    const ids: string[] = [];
    const dayMatrix =
      tracker.frequency.type === 'weekly' && tracker.frequency.daysOfWeek
        ? tracker.frequency.daysOfWeek
        : [0, 1, 2, 3, 4, 5, 6];

    for (const time of tracker.timesOfDay) {
      if (tracker.frequency.type === 'daily') {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: tracker.medicineName || 'Time for your medicine',
            body: `${tracker.dosage.amount} ${tracker.dosage.unit} · ${time.label}`,
            data: { trackerId: tracker._id, timeLabel: time.label },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes?.DAILY ?? 'daily',
            hour: time.hour,
            minute: time.minute,
          },
        });
        ids.push(id);
      } else {
        for (const dow of dayMatrix) {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title: tracker.medicineName || 'Time for your medicine',
              body: `${tracker.dosage.amount} ${tracker.dosage.unit} · ${time.label}`,
              data: { trackerId: tracker._id, timeLabel: time.label },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes?.WEEKLY ?? 'weekly',
              weekday: dow + 1,
              hour: time.hour,
              minute: time.minute,
            },
          });
          ids.push(id);
        }
      }
    }

    const map = loadMap();
    map[tracker._id] = ids;
    saveMap(map);
    return ids;
  } catch {
    return [];
  }
};

export const cancelForTracker = async (trackerId: string): Promise<void> => {
  const Notifications = tryLoadModule();
  if (!Notifications) return;
  try {
    const map = loadMap();
    const ids = map[trackerId] || [];
    for (const id of ids) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {}
    }
    delete map[trackerId];
    saveMap(map);
  } catch {}
};

export const rescheduleAll = async (trackers: Tracker[]): Promise<void> => {
  const Notifications = tryLoadModule();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    saveMap({});
    for (const t of trackers) {
      if (t.active) await scheduleForTracker(t);
    }
  } catch {}
};

export const setupNotificationHandler = (): void => {
  const Notifications = tryLoadModule();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {}
};

export const addResponseListener = (
  onTap: (data: { trackerId?: string; timeLabel?: string }) => void
): (() => void) | null => {
  const Notifications = tryLoadModule();
  if (!Notifications) return null;
  try {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const data = response?.notification?.request?.content?.data || {};
        onTap(data);
      }
    );
    return () => {
      try {
        sub?.remove?.();
      } catch {}
    };
  } catch {
    return null;
  }
};

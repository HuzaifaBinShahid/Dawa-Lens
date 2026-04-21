import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'recent-searches.json';
const MAX_ITEMS = 8;

export type RecentSearch = {
  query: string;
  ts: number;
};

const getFile = () => new File(Paths.document, FILE_NAME);

const read = (): RecentSearch[] => {
  try {
    const file = getFile();
    if (!file.exists) return [];
    const raw = file.textSync();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x: any): x is RecentSearch =>
        x && typeof x.query === 'string' && typeof x.ts === 'number'
    );
  } catch {
    return [];
  }
};

const writeAll = (items: RecentSearch[]) => {
  try {
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(items));
  } catch {
    // Fail silently — history is non-critical.
  }
};

export const RecentSearches = {
  load(): RecentSearch[] {
    return read();
  },

  add(query: string): RecentSearch[] {
    const trimmed = query.trim();
    if (trimmed.length < 2) return read();
    const existing = read();
    const key = trimmed.toLowerCase();
    const deduped = existing.filter((r) => r.query.toLowerCase() !== key);
    const next = [{ query: trimmed, ts: Date.now() }, ...deduped].slice(
      0,
      MAX_ITEMS
    );
    writeAll(next);
    return next;
  },

  remove(query: string): RecentSearch[] {
    const key = query.trim().toLowerCase();
    const next = read().filter((r) => r.query.toLowerCase() !== key);
    writeAll(next);
    return next;
  },

  clear(): void {
    writeAll([]);
  },
};

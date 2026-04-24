import { Config } from '@/constants/config';
import { Medicine, SearchResponse } from '@/types';
import { getDeviceId, getDeviceInfo } from './deviceIdentity';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type HistoryType = 'scan' | 'search';

export type HistoryEvent = {
  _id: string;
  deviceId: string;
  type: HistoryType;
  medicineId: Medicine | string | null;
  query: string | null;
  matchedBrand: string | null;
  timestamp: string;
};

export type SavedEntry = {
  _id: string;
  deviceId: string;
  medicineId: Medicine | string;
  savedAt: string;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Config.requestTimeoutMs);
  try {
    const res = await fetch(`${Config.apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': getDeviceId(),
        ...(init?.headers || {}),
      },
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = (body && body.error) || res.statusText || 'Request failed';
      throw new ApiError(msg, res.status);
    }
    return body as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out', 408);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network error', 0);
  } finally {
    clearTimeout(timeout);
  }
};

export const Api = {
  searchMedicines: (q: string, limit = 5) =>
    request<SearchResponse>(
      `/api/medicines/search?q=${encodeURIComponent(q)}&limit=${limit}`
    ),
  listMedicines: (q?: string, limit = 10) => {
    const qs = q ? `?q=${encodeURIComponent(q)}&limit=${limit}` : `?limit=${limit}`;
    return request<Medicine[]>(`/api/medicines${qs}`);
  },
  getMedicineById: (id: string) => request<Medicine>(`/api/medicines/${id}`),

  registerDevice: () => {
    const info = getDeviceInfo();
    return request<any>('/api/devices/register', {
      method: 'POST',
      body: JSON.stringify({
        deviceId: info.deviceId,
        platform: info.platform,
        osVersion: info.osVersion,
        appVersion: info.appVersion,
        model: info.model,
      }),
    });
  },

  logHistory: (payload: {
    type: HistoryType;
    medicineId?: string | null;
    query?: string | null;
    matchedBrand?: string | null;
  }) =>
    request<HistoryEvent>('/api/history', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getHistory: (opts: { limit?: number; type?: HistoryType } = {}) => {
    const params = new URLSearchParams();
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.type) params.set('type', opts.type);
    const qs = params.toString();
    return request<HistoryEvent[]>(`/api/history${qs ? `?${qs}` : ''}`);
  },

  saveMedicine: (medicineId: string) =>
    request<SavedEntry>('/api/saved', {
      method: 'POST',
      body: JSON.stringify({ medicineId }),
    }),

  unsaveMedicine: (medicineId: string) =>
    request<{ ok: true }>(`/api/saved/${medicineId}`, { method: 'DELETE' }),

  getSaved: () => request<SavedEntry[]>('/api/saved'),
};

export { ApiError };

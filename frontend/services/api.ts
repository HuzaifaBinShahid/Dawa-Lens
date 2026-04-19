import { Config } from '@/constants/config';
import { Medicine, SearchResponse } from '@/types';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Config.requestTimeoutMs);
  try {
    const res = await fetch(`${Config.apiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
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
};

export { ApiError };

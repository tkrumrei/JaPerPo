import { STORAGE_VERSION } from './keys';

interface Envelope<T> {
  version: number;
  data: T;
}

export interface KeyValueDriver {
  read<T>(key: string, fallback: T): Promise<T>;
  write<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

class LocalStorageDriver implements KeyValueDriver {
  async read<T>(key: string, fallback: T): Promise<T> {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      const parsed = JSON.parse(raw) as Envelope<T> | T;
      if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
        return (parsed as Envelope<T>).data;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  }

  async write<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const envelope: Envelope<T> = { version: STORAGE_VERSION, data: value };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  }

  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(key);
  }
}

export const localStorageDriver = new LocalStorageDriver();

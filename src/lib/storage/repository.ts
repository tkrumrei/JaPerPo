import type { KeyValueDriver } from './localStorageDriver';

export interface CrudRepository<T extends { id: string }> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  upsert(item: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export function createCrudRepository<T extends { id: string }>(
  driver: KeyValueDriver,
  key: string,
): CrudRepository<T> {
  return {
    async findAll() {
      return driver.read<T[]>(key, []);
    },
    async findById(id) {
      const all = await driver.read<T[]>(key, []);
      return all.find((item) => item.id === id) ?? null;
    },
    async upsert(item) {
      const all = await driver.read<T[]>(key, []);
      const idx = all.findIndex((entry) => entry.id === item.id);
      if (idx >= 0) all[idx] = item;
      else all.push(item);
      await driver.write(key, all);
    },
    async delete(id) {
      const all = await driver.read<T[]>(key, []);
      await driver.write(
        key,
        all.filter((entry) => entry.id !== id),
      );
    },
  };
}

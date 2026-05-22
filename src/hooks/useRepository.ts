import { useContext } from 'react';
import { StorageContext } from '@/providers/StorageContext';
import type { Repositories } from '@/lib/storage';

export function useRepositories(): Repositories {
  const ctx = useContext(StorageContext);
  if (!ctx) {
    throw new Error('useRepositories must be used within <StorageProvider>');
  }
  return ctx;
}

export function useRepository<K extends keyof Repositories>(name: K): Repositories[K] {
  return useRepositories()[name];
}

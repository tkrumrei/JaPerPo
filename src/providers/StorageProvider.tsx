import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createRepositories } from '@/lib/storage';
import { seedUsers } from '@/lib/storage/seed/seedUsers';
import { StorageContext } from './StorageContext';

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const repositories = useMemo(() => createRepositories(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    seedUsers(repositories.users, repositories.profiles).finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [repositories]);

  if (!ready) return null;

  return <StorageContext.Provider value={repositories}>{children}</StorageContext.Provider>;
}

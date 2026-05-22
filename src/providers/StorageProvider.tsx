import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createRepositories } from '@/lib/storage';
import { seedUsers } from '@/lib/storage/seed/seedUsers';
import { StorageContext } from './StorageContext';

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const { repositories, mode } = useMemo(() => createRepositories(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (mode === 'localStorage') {
        // Supabase-Modus: Seed liegt in der SQL-Migration, hier nicht doppeln.
        await seedUsers(repositories.users, repositories.profiles);
      }
      if (active) setReady(true);
    };
    void init();
    return () => {
      active = false;
    };
  }, [repositories, mode]);

  if (!ready) return null;

  return <StorageContext.Provider value={repositories}>{children}</StorageContext.Provider>;
}

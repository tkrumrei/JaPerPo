import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User, UserId } from '@/types';
import { localStorageDriver } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { isUserId } from '@/lib/constants';
import { useRepository } from '@/hooks/useRepository';
import { AuthContext, type AuthContextValue } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const users = useRepository('users');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const storedId = await localStorageDriver.read<UserId | null>(STORAGE_KEYS.auth, null);
      if (storedId && isUserId(storedId)) {
        const user = await users.findById(storedId);
        if (active) setCurrentUser(user);
      }
      if (active) setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [users]);

  const switchUser = useCallback<AuthContextValue['switchUser']>(
    async (userId) => {
      const user = await users.findById(userId);
      if (!user) throw new Error(`Unknown user ${userId}`);
      await localStorageDriver.write(STORAGE_KEYS.auth, userId);
      setCurrentUser(user);
    },
    [users],
  );

  const logout = useCallback<AuthContextValue['logout']>(() => {
    void localStorageDriver.remove(STORAGE_KEYS.auth);
    setCurrentUser(null);
  }, []);

  const value: AuthContextValue = { currentUser, isReady, switchUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

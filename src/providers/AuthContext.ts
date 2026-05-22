import { createContext } from 'react';
import type { User, UserId } from '@/types';

export interface AuthContextValue {
  currentUser: User | null;
  isReady: boolean;
  switchUser: (userId: UserId) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

import { createContext } from 'react';
import type { Repositories } from '@/lib/storage';

export const StorageContext = createContext<Repositories | null>(null);

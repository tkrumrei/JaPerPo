import type { CefrLevel, LanguageCode } from './language';

export type UserId = 'luca' | 'darian' | 'tobi';

export interface User {
  id: UserId;
  displayName: string;
  avatarColor: string;
  primaryLanguage: LanguageCode;
  currentLevel: CefrLevel;
  createdAt: string;
}

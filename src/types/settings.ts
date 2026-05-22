import type { UserId } from './user';

export type ThemeMode = 'light' | 'dark' | 'system';

export type UiLanguage = 'de' | 'en';

export interface AppSettings {
  themeMode: ThemeMode;
  uiLanguage: UiLanguage;
  persianTransliteration: boolean;
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
}

export interface Profile {
  userId: UserId;
  avatarUrl?: string;
  settings: AppSettings;
  updatedAt: string;
}

export const defaultSettings: AppSettings = {
  themeMode: 'system',
  uiLanguage: 'de',
  persianTransliteration: true,
  dailyGoalMinutes: 10,
  notificationsEnabled: false,
};

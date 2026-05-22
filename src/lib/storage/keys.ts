const NS = 'japerpo';

export const STORAGE_KEYS = {
  users: `${NS}:users`,
  profiles: `${NS}:profiles`,
  progress: `${NS}:progress`,
  vocabulary: `${NS}:vocabulary`,
  dialogues: `${NS}:dialogues`,
  reading: `${NS}:reading`,
  cloze: `${NS}:cloze`,
  tests: `${NS}:tests`,
  sentenceOfTheDay: `${NS}:sentenceOfTheDay`,
  statistics: `${NS}:statistics`,
  leaderboard: `${NS}:leaderboard`,
  // Singletons / app-state
  auth: `${NS}:auth:currentUserId`,
  theme: `${NS}:theme`,
  uiLanguage: `${NS}:uiLanguage`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const STORAGE_VERSION = 1;

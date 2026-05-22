import type { LanguageCode } from './language';
import type { UserId } from './user';

export interface Achievement {
  id: string;
  code: string;
  title: string;
  unlockedAt: string;
}

export interface LanguageStats {
  wordsLearned: number;
  conversationsCompleted: number;
  readingTextsCompleted: number;
  testsCompleted: number;
  minutesStudied: number;
}

export interface Statistics {
  userId: UserId;
  streakDays: number;
  lastStudyDate?: string;
  totalWordsLearned: number;
  totalConversationsCompleted: number;
  totalReadingTextsCompleted: number;
  totalTestsCompleted: number;
  achievements: Achievement[];
  weeklyProgress: number[];
  statsByLanguage: Record<LanguageCode, LanguageStats>;
}

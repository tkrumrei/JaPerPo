import type { LanguageCode } from './language';
import type { UserId } from './user';

export type TestType = 'multiple_choice' | 'cloze' | 'grammar' | 'conversation' | 'mixed';

export interface TestQuestion {
  id: string;
  type: TestType;
  prompt: string;
  options?: string[];
  answer: string;
  hint?: string;
}

export interface Test {
  id: string;
  userId: UserId;
  language: LanguageCode;
  title: string;
  type: TestType;
  questions: TestQuestion[];
  attemptsAllowed: number;
  attemptsUsed: number;
  completed: boolean;
  score?: number;
  createdAt: string;
  completedAt?: string;
}

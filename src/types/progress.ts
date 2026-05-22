import type { LanguageCode } from './language';
import type { UserId } from './user';

export type SrsStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface SrsState {
  status: SrsStatus;
  nextReview: string;
  reviewCount: number;
  easeFactor: number;
  lastAnswerCorrect?: boolean;
}

export interface Progress {
  id: string;
  userId: UserId;
  vocabularyId: string;
  language: LanguageCode;
  srs: SrsState;
  updatedAt: string;
}

import type { LanguageCode } from './language';
import type { UserId } from './user';

export interface SentenceOfTheDay {
  id: string;
  date: string;
  texts: Record<LanguageCode, string>;
  selectedByUserId?: UserId;
  explanation?: string;
  highlightedWords?: string[];
}

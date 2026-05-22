import type { AppSupabaseClient } from '@/lib/supabase/client';
import type { Repositories } from '../index';
import { createSupabaseUserRepository } from './UserRepository';
import { createSupabaseProfileRepository } from './ProfileRepository';
import { createSupabaseProgressRepository } from './ProgressRepository';
import { createSupabaseVocabularyRepository } from './VocabularyRepository';
import { createSupabaseDialogueRepository } from './DialogueRepository';
import { createSupabaseReadingRepository } from './ReadingRepository';
import { createSupabaseClozeRepository } from './ClozeRepository';
import { createSupabaseTestRepository } from './TestRepository';
import { createSupabaseSentenceOfTheDayRepository } from './SentenceOfTheDayRepository';
import { createSupabaseStatisticsRepository } from './StatisticsRepository';
import { createSupabaseLeaderboardRepository } from './LeaderboardRepository';

export function createSupabaseRepositories(client: AppSupabaseClient): Repositories {
  return {
    users: createSupabaseUserRepository(client),
    profiles: createSupabaseProfileRepository(client),
    progress: createSupabaseProgressRepository(client),
    vocabulary: createSupabaseVocabularyRepository(client),
    dialogues: createSupabaseDialogueRepository(client),
    reading: createSupabaseReadingRepository(client),
    cloze: createSupabaseClozeRepository(client),
    tests: createSupabaseTestRepository(client),
    sentenceOfTheDay: createSupabaseSentenceOfTheDayRepository(client),
    statistics: createSupabaseStatisticsRepository(client),
    leaderboard: createSupabaseLeaderboardRepository(client),
  };
}

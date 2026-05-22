import { localStorageDriver } from './localStorageDriver';
import { createUserRepository, type UserRepository } from './repositories/UserRepository';
import { createProfileRepository, type ProfileRepository } from './repositories/ProfileRepository';
import {
  createProgressRepository,
  type ProgressRepository,
} from './repositories/ProgressRepository';
import {
  createVocabularyRepository,
  type VocabularyRepository,
} from './repositories/VocabularyRepository';
import {
  createDialogueRepository,
  type DialogueRepository,
} from './repositories/DialogueRepository';
import { createReadingRepository, type ReadingRepository } from './repositories/ReadingRepository';
import { createClozeRepository, type ClozeRepository } from './repositories/ClozeRepository';
import { createTestRepository, type TestRepository } from './repositories/TestRepository';
import {
  createSentenceOfTheDayRepository,
  type SentenceOfTheDayRepository,
} from './repositories/SentenceOfTheDayRepository';
import {
  createStatisticsRepository,
  type StatisticsRepository,
} from './repositories/StatisticsRepository';
import {
  createLeaderboardRepository,
  type LeaderboardRepository,
} from './repositories/LeaderboardRepository';

export interface Repositories {
  users: UserRepository;
  profiles: ProfileRepository;
  progress: ProgressRepository;
  vocabulary: VocabularyRepository;
  dialogues: DialogueRepository;
  reading: ReadingRepository;
  cloze: ClozeRepository;
  tests: TestRepository;
  sentenceOfTheDay: SentenceOfTheDayRepository;
  statistics: StatisticsRepository;
  leaderboard: LeaderboardRepository;
}

export function createRepositories(): Repositories {
  const driver = localStorageDriver;
  return {
    users: createUserRepository(driver),
    profiles: createProfileRepository(driver),
    progress: createProgressRepository(driver),
    vocabulary: createVocabularyRepository(driver),
    dialogues: createDialogueRepository(driver),
    reading: createReadingRepository(driver),
    cloze: createClozeRepository(driver),
    tests: createTestRepository(driver),
    sentenceOfTheDay: createSentenceOfTheDayRepository(driver),
    statistics: createStatisticsRepository(driver),
    leaderboard: createLeaderboardRepository(driver),
  };
}

export { localStorageDriver } from './localStorageDriver';
export { STORAGE_KEYS } from './keys';

// Hand-geschriebene Typen passend zur SQL-Migration unter
// supabase/migrations/20260522000000_initial_schema.sql.
// Bei Schema-Aenderungen muessen beide Stellen synchron bleiben.

import type {
  Achievement,
  CefrLevel,
  ClozePosition,
  DialogueStep,
  LanguageCode,
  LanguageStats,
  SrsState,
  TestQuestion,
  TestType,
  UserId,
} from '@/types';
import type { AppSettings } from '@/types';

// ---------- Row-Typen ----------

interface UserRow {
  id: UserId;
  display_name: string;
  avatar_color: string;
  primary_language: LanguageCode;
  current_level: CefrLevel;
  created_at: string;
}

interface ProfileRow {
  user_id: UserId;
  avatar_url: string | null;
  settings: AppSettings;
  updated_at: string;
}

interface VocabularyRow {
  id: string;
  language: LanguageCode;
  word: string;
  translation: string;
  transcription: string | null;
  context_sentence: string | null;
  example_sentence: string | null;
  difficulty: number;
  level: CefrLevel;
  category: string | null;
  ai_generated: boolean;
  created_at: string;
}

interface ProgressRow {
  id: string;
  user_id: UserId;
  vocabulary_id: string;
  language: LanguageCode;
  srs: SrsState;
  updated_at: string;
}

interface DialogueRow {
  id: string;
  language: LanguageCode;
  title: string;
  scenario: string;
  steps: DialogueStep[];
  level: CefrLevel;
  ai_generated: boolean;
  created_at: string;
}

interface ReadingRow {
  id: string;
  language: LanguageCode;
  title: string;
  content: string;
  level: CefrLevel;
  word_count: number;
  ai_generated: boolean;
  created_at: string;
}

interface ClozeRow {
  id: string;
  language: LanguageCode;
  title: string;
  content_text: string;
  positions: ClozePosition[];
  level: CefrLevel;
  ai_generated: boolean;
  created_at: string;
}

interface TestRow {
  id: string;
  user_id: UserId;
  language: LanguageCode;
  title: string;
  type: TestType;
  questions: TestQuestion[];
  attempts_allowed: number;
  attempts_used: number;
  completed: boolean;
  score: number | null;
  created_at: string;
  completed_at: string | null;
}

interface SentenceOfTheDayRow {
  id: string;
  date: string;
  texts: Record<LanguageCode, string>;
  selected_by_user_id: UserId | null;
  explanation: string | null;
  highlighted_words: string[] | null;
}

interface StatisticsRow {
  user_id: UserId;
  streak_days: number;
  last_study_date: string | null;
  total_words_learned: number;
  total_conversations_completed: number;
  total_reading_texts_completed: number;
  total_tests_completed: number;
  achievements: Achievement[];
  weekly_progress: number[];
  stats_by_language: Record<LanguageCode, LanguageStats>;
  updated_at: string;
}

interface LeaderboardRow {
  user_id: UserId;
  rank: number;
  xp: number;
  streak_days: number;
  updated_at: string;
}

interface AiUsageRow {
  id: string;
  user_id: UserId;
  endpoint: string;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

// ---------- Insert-Helper ----------
// Felder, die in der DB Default-Werte haben (`uuid_generate_v4()`, `now()`),
// duerfen beim Insert weggelassen werden.

type WithGeneratedId<T extends { id: string }> = Omit<T, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// ---------- Database ----------

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserRow;
        Update: Partial<UserRow>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { user_id: UserId; settings: AppSettings };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      vocabulary_items: {
        Row: VocabularyRow;
        Insert: WithGeneratedId<VocabularyRow>;
        Update: Partial<VocabularyRow>;
        Relationships: [];
      };
      progress: {
        Row: ProgressRow;
        Insert: Omit<ProgressRow, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<ProgressRow>;
        Relationships: [];
      };
      dialogues: {
        Row: DialogueRow;
        Insert: WithGeneratedId<DialogueRow>;
        Update: Partial<DialogueRow>;
        Relationships: [];
      };
      reading_texts: {
        Row: ReadingRow;
        Insert: WithGeneratedId<ReadingRow>;
        Update: Partial<ReadingRow>;
        Relationships: [];
      };
      cloze_texts: {
        Row: ClozeRow;
        Insert: WithGeneratedId<ClozeRow>;
        Update: Partial<ClozeRow>;
        Relationships: [];
      };
      tests: {
        Row: TestRow;
        Insert: WithGeneratedId<TestRow>;
        Update: Partial<TestRow>;
        Relationships: [];
      };
      sentence_of_the_day: {
        Row: SentenceOfTheDayRow;
        Insert: Omit<SentenceOfTheDayRow, 'id'> & { id?: string };
        Update: Partial<SentenceOfTheDayRow>;
        Relationships: [];
      };
      statistics: {
        Row: StatisticsRow;
        Insert: Partial<StatisticsRow> & { user_id: UserId };
        Update: Partial<StatisticsRow>;
        Relationships: [];
      };
      leaderboard: {
        Row: LeaderboardRow;
        Insert: Partial<LeaderboardRow> & { user_id: UserId };
        Update: Partial<LeaderboardRow>;
        Relationships: [];
      };
      ai_usage: {
        Row: AiUsageRow;
        Insert: Omit<AiUsageRow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<AiUsageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      language_code: LanguageCode;
      cefr_level: CefrLevel;
      test_type: TestType;
    };
  };
}

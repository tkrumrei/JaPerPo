import type {
  ClozeText,
  Dialogue,
  LeaderboardEntry,
  Profile,
  Progress,
  ReadingText,
  SentenceOfTheDay,
  Statistics,
  Test,
  User,
  VocabularyItem,
} from '@/types';
import type { Database } from '@/lib/supabase/database';

type Tables = Database['public']['Tables'];

// ---------- User ----------
export const userFromRow = (row: Tables['users']['Row']): User => ({
  id: row.id,
  displayName: row.display_name,
  avatarColor: row.avatar_color,
  primaryLanguage: row.primary_language,
  currentLevel: row.current_level,
  createdAt: row.created_at,
});

export const userToRow = (user: User): Tables['users']['Insert'] => ({
  id: user.id,
  display_name: user.displayName,
  avatar_color: user.avatarColor,
  primary_language: user.primaryLanguage,
  current_level: user.currentLevel,
  created_at: user.createdAt,
});

// ---------- Profile ----------
export const profileFromRow = (row: Tables['profiles']['Row']): Profile => ({
  userId: row.user_id,
  avatarUrl: row.avatar_url ?? undefined,
  settings: row.settings,
  updatedAt: row.updated_at,
});

export const profileToRow = (profile: Profile): Tables['profiles']['Insert'] => ({
  user_id: profile.userId,
  avatar_url: profile.avatarUrl ?? null,
  settings: profile.settings,
  updated_at: profile.updatedAt,
});

// ---------- Vocabulary ----------
export const vocabularyFromRow = (row: Tables['vocabulary_items']['Row']): VocabularyItem => ({
  id: row.id,
  language: row.language,
  word: row.word,
  translation: row.translation,
  transcription: row.transcription ?? undefined,
  contextSentence: row.context_sentence ?? undefined,
  exampleSentence: row.example_sentence ?? undefined,
  difficulty: row.difficulty,
  level: row.level,
  category: row.category ?? undefined,
  aiGenerated: row.ai_generated,
  createdAt: row.created_at,
});

export const vocabularyToRow = (
  item: VocabularyItem,
): Tables['vocabulary_items']['Insert'] => ({
  id: item.id,
  language: item.language,
  word: item.word,
  translation: item.translation,
  transcription: item.transcription ?? null,
  context_sentence: item.contextSentence ?? null,
  example_sentence: item.exampleSentence ?? null,
  difficulty: item.difficulty,
  level: item.level,
  category: item.category ?? null,
  ai_generated: item.aiGenerated,
  created_at: item.createdAt,
});

// ---------- Progress ----------
export const progressFromRow = (row: Tables['progress']['Row']): Progress => ({
  id: row.id,
  userId: row.user_id,
  vocabularyId: row.vocabulary_id,
  language: row.language,
  srs: row.srs,
  updatedAt: row.updated_at,
});

export const progressToRow = (progress: Progress): Tables['progress']['Insert'] => ({
  id: progress.id,
  user_id: progress.userId,
  vocabulary_id: progress.vocabularyId,
  language: progress.language,
  srs: progress.srs,
  updated_at: progress.updatedAt,
});

// ---------- Dialogue ----------
export const dialogueFromRow = (row: Tables['dialogues']['Row']): Dialogue => ({
  id: row.id,
  language: row.language,
  title: row.title,
  scenario: row.scenario,
  steps: row.steps,
  level: row.level,
  aiGenerated: row.ai_generated,
  createdAt: row.created_at,
});

export const dialogueToRow = (d: Dialogue): Tables['dialogues']['Insert'] => ({
  id: d.id,
  language: d.language,
  title: d.title,
  scenario: d.scenario,
  steps: d.steps,
  level: d.level,
  ai_generated: d.aiGenerated,
  created_at: d.createdAt,
});

// ---------- Reading ----------
export const readingFromRow = (row: Tables['reading_texts']['Row']): ReadingText => ({
  id: row.id,
  language: row.language,
  title: row.title,
  content: row.content,
  level: row.level,
  wordCount: row.word_count,
  aiGenerated: row.ai_generated,
  createdAt: row.created_at,
});

export const readingToRow = (r: ReadingText): Tables['reading_texts']['Insert'] => ({
  id: r.id,
  language: r.language,
  title: r.title,
  content: r.content,
  level: r.level,
  word_count: r.wordCount,
  ai_generated: r.aiGenerated,
  created_at: r.createdAt,
});

// ---------- Cloze ----------
export const clozeFromRow = (row: Tables['cloze_texts']['Row']): ClozeText => ({
  id: row.id,
  language: row.language,
  title: row.title,
  contentText: row.content_text,
  positions: row.positions,
  level: row.level,
  aiGenerated: row.ai_generated,
  createdAt: row.created_at,
});

export const clozeToRow = (c: ClozeText): Tables['cloze_texts']['Insert'] => ({
  id: c.id,
  language: c.language,
  title: c.title,
  content_text: c.contentText,
  positions: c.positions,
  level: c.level,
  ai_generated: c.aiGenerated,
  created_at: c.createdAt,
});

// ---------- Test ----------
export const testFromRow = (row: Tables['tests']['Row']): Test => ({
  id: row.id,
  userId: row.user_id,
  language: row.language,
  title: row.title,
  type: row.type,
  questions: row.questions,
  attemptsAllowed: row.attempts_allowed,
  attemptsUsed: row.attempts_used,
  completed: row.completed,
  score: row.score ?? undefined,
  createdAt: row.created_at,
  completedAt: row.completed_at ?? undefined,
});

export const testToRow = (t: Test): Tables['tests']['Insert'] => ({
  id: t.id,
  user_id: t.userId,
  language: t.language,
  title: t.title,
  type: t.type,
  questions: t.questions,
  attempts_allowed: t.attemptsAllowed,
  attempts_used: t.attemptsUsed,
  completed: t.completed,
  score: t.score ?? null,
  created_at: t.createdAt,
  completed_at: t.completedAt ?? null,
});

// ---------- Sentence of the Day ----------
export const sotdFromRow = (
  row: Tables['sentence_of_the_day']['Row'],
): SentenceOfTheDay => ({
  id: row.id,
  date: row.date,
  texts: row.texts,
  selectedByUserId: row.selected_by_user_id ?? undefined,
  explanation: row.explanation ?? undefined,
  highlightedWords: row.highlighted_words ?? undefined,
});

export const sotdToRow = (
  s: SentenceOfTheDay,
): Tables['sentence_of_the_day']['Insert'] => ({
  id: s.id,
  date: s.date,
  texts: s.texts,
  selected_by_user_id: s.selectedByUserId ?? null,
  explanation: s.explanation ?? null,
  highlighted_words: s.highlightedWords ?? null,
});

// ---------- Statistics ----------
export const statisticsFromRow = (row: Tables['statistics']['Row']): Statistics => ({
  userId: row.user_id,
  streakDays: row.streak_days,
  lastStudyDate: row.last_study_date ?? undefined,
  totalWordsLearned: row.total_words_learned,
  totalConversationsCompleted: row.total_conversations_completed,
  totalReadingTextsCompleted: row.total_reading_texts_completed,
  totalTestsCompleted: row.total_tests_completed,
  achievements: row.achievements,
  weeklyProgress: row.weekly_progress,
  statsByLanguage: row.stats_by_language,
});

export const statisticsToRow = (s: Statistics): Tables['statistics']['Insert'] => ({
  user_id: s.userId,
  streak_days: s.streakDays,
  last_study_date: s.lastStudyDate ?? null,
  total_words_learned: s.totalWordsLearned,
  total_conversations_completed: s.totalConversationsCompleted,
  total_reading_texts_completed: s.totalReadingTextsCompleted,
  total_tests_completed: s.totalTestsCompleted,
  achievements: s.achievements,
  weekly_progress: s.weeklyProgress,
  stats_by_language: s.statsByLanguage,
});

// ---------- Leaderboard ----------
export const leaderboardFromRow = (
  row: Tables['leaderboard']['Row'],
): LeaderboardEntry => ({
  userId: row.user_id,
  rank: row.rank,
  xp: row.xp,
  streakDays: row.streak_days,
  updatedAt: row.updated_at,
});

export const leaderboardToRow = (
  e: LeaderboardEntry,
): Tables['leaderboard']['Insert'] => ({
  user_id: e.userId,
  rank: e.rank,
  xp: e.xp,
  streak_days: e.streakDays,
  updated_at: e.updatedAt,
});

import type { SrsState, SrsStatus } from '@/types';

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MASTERY_REPS = 8;

export function initialState(): SrsState {
  return {
    status: 'new',
    nextReview: new Date().toISOString(),
    reviewCount: 0,
    easeFactor: DEFAULT_EASE,
  };
}

function addDaysIso(days: number): string {
  const now = Date.now();
  return new Date(now + days * 86_400_000).toISOString();
}

function intervalDays(reviewCount: number, ease: number): number {
  if (reviewCount <= 0) return 0;
  if (reviewCount === 1) return 1;
  if (reviewCount === 2) return 6;
  return Math.max(1, Math.round(6 * Math.pow(ease, reviewCount - 2)));
}

export function answerCard(state: SrsState, quality: Quality): SrsState {
  if (quality < 3) {
    return {
      status: 'learning',
      easeFactor: Math.max(MIN_EASE, state.easeFactor - 0.2),
      reviewCount: 0,
      nextReview: addDaysIso(1),
      lastAnswerCorrect: false,
    };
  }

  const ease = Math.max(
    MIN_EASE,
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );
  const reviewCount = state.reviewCount + 1;
  const days = intervalDays(reviewCount, ease);
  const status: SrsStatus = reviewCount >= MASTERY_REPS ? 'mastered' : 'review';

  return {
    status,
    easeFactor: ease,
    reviewCount,
    nextReview: addDaysIso(days),
    lastAnswerCorrect: true,
  };
}

export function isDue(state: SrsState, now: Date = new Date()): boolean {
  return new Date(state.nextReview).getTime() <= now.getTime();
}

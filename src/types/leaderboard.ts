import type { UserId } from './user';

export interface LeaderboardEntry {
  userId: UserId;
  rank: number;
  xp: number;
  streakDays: number;
  updatedAt: string;
}

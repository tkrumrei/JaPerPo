import type { LanguageCode, UserId } from '@/types';

export const APP_NAME = 'JaPerPo';

export const USER_IDS = ['luca', 'darian', 'tobi'] as const satisfies readonly UserId[];

export const LANGUAGE_CODES = ['ja', 'fa', 'pt'] as const satisfies readonly LanguageCode[];

export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && (USER_IDS as readonly string[]).includes(value);
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return typeof value === 'string' && (LANGUAGE_CODES as readonly string[]).includes(value);
}

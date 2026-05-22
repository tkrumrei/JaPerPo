import type { LanguageCode } from '@/types';
import { isLanguageCode } from '@/lib/constants';
import { ja } from './ja/config';
import { fa } from './fa/config';
import { pt } from './pt/config';
import type { LanguageConfig } from './types';

export const LANGUAGES: Record<LanguageCode, LanguageConfig> = { ja, fa, pt };

export function getLanguageConfig(code: LanguageCode): LanguageConfig {
  return LANGUAGES[code];
}

export function isValidLanguageCode(value: unknown): value is LanguageCode {
  return isLanguageCode(value);
}

export type { LanguageConfig, LanguageFeatures } from './types';

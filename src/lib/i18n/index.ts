import type { UiLanguage } from '@/types';
import { de, type Dictionary } from './de';
import { en } from './en';

export const dictionaries: Record<UiLanguage, Dictionary> = { de, en };

export type TranslationKey = NestedKeyOf<Dictionary>;

type Primitive = string | number | boolean | null | undefined;
type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends Primitive
    ? `${K}`
    : T[K] extends object
      ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
      : never;
}[keyof T & (string | number)];

export function translate(dict: Dictionary, key: TranslationKey): string {
  const segments = (key as string).split('.');
  let cur: unknown = dict;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return key as string;
    }
  }
  return typeof cur === 'string' ? cur : (key as string);
}

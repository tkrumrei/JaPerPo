import { Link, useParams } from 'react-router-dom';
import type { LanguageCode } from '@/types';
import { isLanguageCode } from '@/lib/constants';
import { getLanguageConfig } from '@/languages';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface FeatureSection {
  to: string;
  flag: keyof ReturnType<typeof getLanguageConfig>['features'];
  title: string;
  description: string;
  icon: string;
}

const SECTIONS: FeatureSection[] = [
  {
    to: 'vocab',
    flag: 'vocabulary',
    title: 'Vokabeltrainer',
    description: 'Spaced Repetition mit KI-generierten Vokabeln.',
    icon: '🃏',
  },
  {
    to: 'dialogues',
    flag: 'dialogues',
    title: 'Echtwelt-Szenarien',
    description: 'Bahnhof, Bäcker, Restaurant — Schritt fuer Schritt.',
    icon: '💬',
  },
  {
    to: 'chat',
    flag: 'freeChat',
    title: 'Freier Chat',
    description: 'Sprich frei mit der KI in der Zielsprache.',
    icon: '🤖',
  },
  {
    to: 'reading',
    flag: 'reading',
    title: 'Lesetexte',
    description: 'Niveaugerechte Lesetexte aus dem Alltag.',
    icon: '📖',
  },
  {
    to: 'grammar',
    flag: 'grammar',
    title: 'Grammatik',
    description: 'Konjugationen, Deklinationen, Sonderformen.',
    icon: '📐',
  },
  {
    to: 'tests',
    flag: 'tests',
    title: 'Tests',
    description: 'Gemischte Tests mit begrenzten Versuchen — Extra-Punkte moeglich.',
    icon: '🎯',
  },
];

export function LanguageHubPage() {
  const params = useParams<{ lang?: string }>();
  if (!params.lang || !isLanguageCode(params.lang)) return null;
  const code = params.lang as LanguageCode;
  const config = getLanguageConfig(code);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-4xl" aria-hidden>
            {config.flag}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {config.germanName}{' '}
              <span className="font-normal text-text-muted">· {config.nativeName}</span>
            </h1>
            <p className="text-sm text-text-secondary">{config.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{config.levels.min}–{config.levels.max}</Badge>
          {config.rtl && <Badge>RTL</Badge>}
          {config.variant && <Badge>Variante: {config.variant}</Badge>}
          {!config.features.writing && <Badge tone="warning">Ohne Schreibuebungen</Badge>}
          {config.features.transliterationToggle && <Badge tone="accent">Lautschrift</Badge>}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.filter((s) => config.features[s.flag]).map((section) => (
          <Link key={section.to} to={section.to}>
            <Card interactive>
              <div className="flex items-start justify-between">
                <span className="text-3xl" aria-hidden>
                  {section.icon}
                </span>
                <span className="text-xs text-text-muted">In Arbeit</span>
              </div>
              <CardTitle className="mt-3">{section.title}</CardTitle>
              <CardDescription className="mt-1">{section.description}</CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

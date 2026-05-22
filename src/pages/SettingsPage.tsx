import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useRepository } from '@/hooks/useRepository';
import { defaultSettings, type Profile } from '@/types';
import { nowIso } from '@/lib/utils/date';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function SettingsPage() {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const profiles = useRepository('profiles');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    void profiles.findByUserId(currentUser.id).then((existing) => {
      if (existing) {
        setProfile(existing);
        return;
      }
      const fresh: Profile = {
        userId: currentUser.id,
        settings: { ...defaultSettings },
        updatedAt: nowIso(),
      };
      void profiles.upsert(fresh).then(() => setProfile(fresh));
    });
  }, [currentUser, profiles]);

  const updateSetting = async <K extends keyof Profile['settings']>(
    key: K,
    value: Profile['settings'][K],
  ) => {
    if (!profile) return;
    const next: Profile = {
      ...profile,
      settings: { ...profile.settings, [key]: value },
      updatedAt: nowIso(),
    };
    setProfile(next);
    await profiles.upsert(next);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.theme.label')}</CardTitle>
        </CardHeader>
        <CardDescription>
          Helles oder dunkles Erscheinungsbild — oder automatisch dem System folgen.
        </CardDescription>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </Card>

      <Card data-lang="fa">
        <CardHeader>
          <CardTitle>{t('settings.transliteration.label')}</CardTitle>
          <Badge tone="accent">🇮🇷 Persisch</Badge>
        </CardHeader>
        <CardDescription>{t('settings.transliteration.hint')}</CardDescription>
        <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3">
          <span className="text-sm">Lateinische Lautschrift anzeigen</span>
          <input
            type="checkbox"
            className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-border transition-colors checked:bg-accent"
            checked={profile?.settings.persianTransliteration ?? true}
            onChange={(event) =>
              void updateSetting('persianTransliteration', event.target.checked)
            }
          />
        </label>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.uiLanguage.label')}</CardTitle>
          <Badge>DE</Badge>
        </CardHeader>
        <CardDescription>{t('settings.uiLanguage.hint')}</CardDescription>
      </Card>
    </div>
  );
}

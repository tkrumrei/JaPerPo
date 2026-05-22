import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { MyLanguageCard } from '@/components/dashboard/MyLanguageCard';
import { LeaderboardWidget } from '@/components/dashboard/LeaderboardWidget';
import { SentenceOfTheDayWidget } from '@/components/dashboard/SentenceOfTheDayWidget';
import { NextLessonsWidget } from '@/components/dashboard/NextLessonsWidget';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const name = currentUser?.displayName ?? '';

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <p className="text-sm text-text-muted">{t('dashboard.welcome')}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hallo, {name} 👋
        </h1>
      </header>

      <MyLanguageCard />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentenceOfTheDayWidget />
        </div>
        <LeaderboardWidget />
        <div className="lg:col-span-3">
          <NextLessonsWidget />
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardTitle className="text-2xl">{t('notFound.title')}</CardTitle>
        <CardDescription className="mt-2">{t('notFound.description')}</CardDescription>
        <div className="mt-4 flex justify-center">
          <Link to="/dashboard">
            <Button>{t('notFound.cta')}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

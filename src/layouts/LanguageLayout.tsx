import { Navigate, Outlet, useParams } from 'react-router-dom';
import type { LanguageCode } from '@/types';
import { isLanguageCode } from '@/lib/constants';
import { getLanguageConfig } from '@/languages';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSubNav } from './LanguageSubNav';

export function LanguageLayout() {
  const params = useParams<{ lang?: string }>();
  const { currentUser } = useAuth();

  if (!params.lang || !isLanguageCode(params.lang)) {
    return <Navigate to="/dashboard" replace />;
  }
  const code = params.lang as LanguageCode;

  if (currentUser && currentUser.primaryLanguage !== code) {
    return <Navigate to={`/lang/${currentUser.primaryLanguage}`} replace />;
  }

  const config = getLanguageConfig(code);

  return (
    <div data-lang={code} className="animate-fade-in">
      <LanguageSubNav config={config} />
      <Outlet />
    </div>
  );
}

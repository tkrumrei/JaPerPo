import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { hasSupabase } from '@/lib/supabase/client';
import { createGeminiProvider } from '@/lib/ai/gemini';
import type { AIProvider } from '@/lib/ai';

/**
 * Liefert einen AIProvider, der die Edge Function aufruft, sobald
 * Supabase konfiguriert und ein User eingeloggt ist. Sonst `null`.
 */
export function useAI(): AIProvider | null {
  const { currentUser } = useAuth();
  return useMemo(() => {
    if (!currentUser || !hasSupabase()) return null;
    return createGeminiProvider(currentUser.id);
  }, [currentUser]);
}

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface text-text-secondary border border-border',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-300',
};

export function Badge({ className, tone = 'neutral', ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}

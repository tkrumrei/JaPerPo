import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center',
        className,
      )}
    >
      {icon && <div className="text-3xl text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

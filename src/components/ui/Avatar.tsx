import { cn } from '@/lib/utils/cn';

export interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
} as const;

export function Avatar({ name, color = '#52525b', size = 'md', className }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  return (
    <span
      className={cn(
        'inline-flex select-none items-center justify-center rounded-full font-semibold text-white shadow-card',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}

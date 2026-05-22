import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all ' +
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none';

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-6 text-lg',
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-accent-contrast shadow-card hover:brightness-105',
  secondary:
    'bg-surface-elevated text-text-primary border border-border hover:bg-surface',
  ghost: 'text-text-primary hover:bg-surface',
  danger: 'bg-tinto-600 text-white hover:bg-tinto-700',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', fullWidth, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
});

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: '',
};

export function Container({ className, size = 'lg', ...rest }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6', sizeClasses[size], className)}
      {...rest}
    />
  );
}

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'danger' | 'muted'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-[var(--primary-light)] text-[var(--primary)]',
        variant === 'danger'  && 'bg-[rgba(255,59,48,0.1)] text-[var(--destructive)]',
        variant === 'muted'   && 'bg-[var(--surface2)] text-[var(--fg3)]',
        className,
      )}
      {...props}
    />
  )
}

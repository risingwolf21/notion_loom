import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-[var(--separator)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--fg3)] outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-40 transition-shadow',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

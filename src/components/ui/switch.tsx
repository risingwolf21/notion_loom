import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

type SwitchProps = ComponentPropsWithoutRef<typeof BaseSwitch.Root>

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(
        'relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200',
        'bg-[var(--separator)] data-[checked]:bg-[var(--primary)]',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2',
        className,
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm',
          'transition-transform duration-200',
          'translate-x-0 data-[checked]:translate-x-5',
        )}
      />
    </BaseSwitch.Root>
  )
}

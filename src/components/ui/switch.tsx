import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

type SwitchProps = ComponentPropsWithoutRef<typeof BaseSwitch.Root>

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200 outline-none',
        'bg-input data-[checked]:bg-primary',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0',
          'transition-transform duration-200',
          'translate-x-0 data-[checked]:translate-x-4',
        )}
      />
    </BaseSwitch.Root>
  )
}

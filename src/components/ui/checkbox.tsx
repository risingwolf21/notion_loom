import { forwardRef } from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef } from 'react'

type CheckboxProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Root>

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <BaseCheckbox.Root
      ref={ref}
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-primary shadow-xs outline-none',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[checked]:border-primary',
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3" strokeWidth={3} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  ),
)
Checkbox.displayName = 'Checkbox'

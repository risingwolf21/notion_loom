import { Separator as BaseSep } from '@base-ui/react/separator'
import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  inset?: boolean
}

export function Separator({ className, orientation = 'horizontal', inset }: SeparatorProps) {
  return (
    <BaseSep
      orientation={orientation}
      className={cn(
        'bg-[var(--separator)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        inset && 'ml-11',
        className,
      )}
    />
  )
}

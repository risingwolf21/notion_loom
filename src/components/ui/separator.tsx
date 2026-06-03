import { Separator as BaseSeparator } from '@base-ui/react/separator'
import * as React from 'react'
import { cn } from '@/lib/utils'

type SeparatorProps = React.ComponentProps<typeof BaseSeparator>

export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      className={cn(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className,
      )}
      {...props}
    />
  )
}

import { Progress as BaseProgress } from '@base-ui/react/progress'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
}

export function Progress({ value, max = 100, className }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <BaseProgress.Root value={pct} className={cn('w-full', className)}>
      <BaseProgress.Track
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <BaseProgress.Indicator
          className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
}

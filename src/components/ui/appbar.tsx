import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  onBack?: () => void
  actions?: React.ReactNode
  withScrollEffect?: boolean
}

export function AppBar({
  title,
  onBack,
  actions,
  withScrollEffect = true,
  className,
  ...props
}: AppBarProps) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    if (!withScrollEffect) return
    const handle = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handle)
    return () => window.removeEventListener('scroll', handle)
  }, [withScrollEffect])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        'bg-background/80 text-foreground backdrop-blur-md',
        scrolled
          ? 'border-b border-border shadow-sm'
          : 'border-b border-transparent',
        className,
      )}
      {...props}
    >
      <div className="flex h-14 w-full items-center gap-2 px-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Back"
            className="-ml-1 shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}
        {title && (
          <div className="flex-1 min-w-0 font-semibold tracking-tight text-lg truncate">
            {title}
          </div>
        )}
        {!title && <div className="flex-1" />}
        {actions && (
          <div className="flex items-center gap-1 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}

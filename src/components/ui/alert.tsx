import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

const config = {
  error: {
    wrapper: 'bg-[rgba(255,59,48,0.08)] border-[rgba(255,59,48,0.15)] text-[var(--destructive)]',
    Icon: AlertCircle,
  },
  warning: {
    wrapper: 'bg-[rgba(255,149,0,0.08)] border-[rgba(255,149,0,0.15)] text-[var(--warning)]',
    Icon: AlertTriangle,
  },
  success: {
    wrapper: 'bg-[rgba(52,199,89,0.08)] border-[rgba(52,199,89,0.15)] text-[var(--success)]',
    Icon: CheckCircle2,
  },
  info: {
    wrapper: 'bg-[var(--primary-light)] border-[rgba(0,122,255,0.15)] text-[var(--primary)]',
    Icon: Info,
  },
} as const

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof config
  title?: string
  children: ReactNode
}

export function Alert({ variant = 'error', title, children, className, ...props }: AlertProps) {
  const { wrapper, Icon } = config[variant]
  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', wrapper, className)}
      {...props}
    >
      <Icon size={15} className="mt-0.5 shrink-0" />
      <div className="flex-1 leading-snug">
        {title && <p className="font-medium">{title}</p>}
        <p className={cn(title && 'mt-0.5 text-xs opacity-80')}>{children}</p>
      </div>
    </div>
  )
}

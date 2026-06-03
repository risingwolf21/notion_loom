import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default:
          'bg-card text-card-foreground',
        destructive:
          'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current',
        error:
          'bg-error-50 border-error-50 text-error-900 [&>svg]:text-error-500',
        warning:
          'bg-warning-50 border-warning-50 text-warning-900 [&>svg]:text-warning-500',
        success:
          'bg-success-50 border-success-50 text-success-900 [&>svg]:text-success-500',
        info:
          'bg-info-50 border-info-50 text-info-900 [&>svg]:text-info-500',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const icons = {
  default:     Info,
  destructive: AlertCircle,
  error:       AlertCircle,
  warning:     AlertTriangle,
  success:     CheckCircle2,
  info:        Info,
}

interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  children: ReactNode
}

export function Alert({ variant = 'default', title, children, className, ...props }: AlertProps) {
  const Icon = icons[variant ?? 'default']
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="size-4 shrink-0" />
      <div className="col-start-2 flex flex-col gap-0.5 leading-snug">
        {title && <p data-slot="alert-title" className="font-medium">{title}</p>}
        <p data-slot="alert-description" className={cn(title && 'text-xs opacity-80')}>{children}</p>
      </div>
    </div>
  )
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}

export function AlertAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-2 right-2', className)}
      {...props}
    />
  )
}

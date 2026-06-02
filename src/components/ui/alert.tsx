import { type HTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        default:     'bg-card text-foreground border-border',
        destructive: 'bg-destructive/8 text-destructive border-destructive/20 [&>svg]:text-destructive',
        warning:     'bg-warning/8 text-warning border-warning/20 [&>svg]:text-warning',
        success:     'bg-success/8 text-success border-success/20 [&>svg]:text-success',
        info:        'bg-primary/8 text-primary border-primary/20 [&>svg]:text-primary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const icons = {
  default:     Info,
  destructive: AlertCircle,
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
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="size-4 shrink-0 mt-0.5" />
      <div className="flex-1 leading-snug">
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <p className={cn(title && 'text-xs opacity-80')}>{children}</p>
      </div>
    </div>
  )
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('font-medium leading-none tracking-tight', className)} {...props} />
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
}

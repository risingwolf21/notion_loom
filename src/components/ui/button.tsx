import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 active:scale-95 select-none',
  {
    variants: {
      variant: {
        default:     'bg-[var(--primary)] text-white shadow-sm hover:opacity-90',
        destructive: 'bg-[var(--destructive)] text-white hover:opacity-90',
        outline:     'border border-[var(--separator)] bg-[var(--card)] hover:bg-[var(--surface2)]',
        ghost:       'hover:bg-[var(--surface2)] text-[var(--fg)]',
        link:        'text-[var(--primary)] p-0 h-auto hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-6 text-base',
        icon:    'h-9 w-9 rounded-full p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
)
Button.displayName = 'Button'

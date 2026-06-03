import { Dialog } from '@base-ui/react/dialog'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  )
}

export function SheetTrigger({ children }: { children: ReactNode }) {
  return <Dialog.Trigger render={<>{children}</>} />
}

interface SheetContentProps {
  children: ReactNode
  className?: string
  title: string
  side?: 'right' | 'bottom'
}

export function SheetContent({ children, className, title, side = 'right' }: SheetContentProps) {
  const isRight = side === 'right'

  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className="fixed inset-0 bg-black/40 z-40"
        style={{ animation: 'backdrop-in 0.2s ease' }}
      />
      <Dialog.Popup
        className={cn(
          'fixed z-50 bg-background shadow-xl overflow-y-auto',
          isRight
            ? 'inset-y-0 right-0 h-full w-80 max-w-[90vw] border-l border-border'
            : 'bottom-0 left-0 right-0 max-h-[90dvh] rounded-t-2xl',
          className,
        )}
        style={{
          animation: isRight
            ? 'sheet-right-in 0.25s cubic-bezier(0.16,1,0.3,1)'
            : undefined,
        }}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  )
}

export function SheetClose({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <Dialog.Close className={cn('inline-flex items-center justify-center', className)}>
      {children}
    </Dialog.Close>
  )
}

export function SheetTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h2 className={cn('text-base font-semibold text-foreground', className)}>
      {children}
    </h2>
  )
}

export function SheetDescription({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

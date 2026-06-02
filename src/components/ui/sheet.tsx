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
}

export function SheetContent({ children, className, title }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop
        className="fixed inset-0 bg-black/40 z-40"
        style={{ animation: 'backdrop-in 0.2s ease' }}
      />
      <Dialog.Popup
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] rounded-t-2xl shadow-xl',
          'max-h-[90dvh] overflow-y-auto',
          'pb-[env(safe-area-inset-bottom)]',
          className,
        )}
        style={{ animation: 'sheet-up 0.3s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}

export function SheetClose({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <Dialog.Close
      className={cn('inline-flex items-center justify-center', className)}
    >
      {children}
    </Dialog.Close>
  )
}

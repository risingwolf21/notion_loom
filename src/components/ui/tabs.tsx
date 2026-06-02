import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export const TabsRoot = BaseTabs.Root

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <BaseTabs.List
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      {children}
    </BaseTabs.List>
  )
}

type TabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>

export function TabsTrigger({ children, className, ...props }: TabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium',
        'transition-all duration-150 select-none cursor-pointer',
        'ring-offset-background outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[selected]:bg-card data-[selected]:text-foreground data-[selected]:shadow-sm',
        className,
      )}
    >
      {children}
    </BaseTabs.Tab>
  )
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children?: ReactNode
  className?: string
}) {
  return (
    <BaseTabs.Panel
      value={value}
      className={cn('mt-2 outline-none', className)}
    >
      {children}
    </BaseTabs.Panel>
  )
}

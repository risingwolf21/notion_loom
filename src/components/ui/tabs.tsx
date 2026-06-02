import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export const TabsRoot = BaseTabs.Root

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <BaseTabs.List
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl bg-[var(--surface2)] p-1',
        className,
      )}
    >
      {children}
    </BaseTabs.List>
  )
}

type TabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>

export function TabsTab({ children, className, ...props }: TabProps) {
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium',
        'transition-all duration-150 select-none cursor-pointer',
        'text-[var(--fg3)] hover:text-[var(--fg2)]',
        'data-[selected]:bg-[var(--card)] data-[selected]:text-[var(--fg)] data-[selected]:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
        className,
      )}
    >
      {children}
    </BaseTabs.Tab>
  )
}

export function TabsPanel({
  value,
  children,
  className,
}: {
  value: string
  children?: ReactNode
  className?: string
}) {
  return (
    <BaseTabs.Panel value={value} className={cn('outline-none', className)}>
      {children}
    </BaseTabs.Panel>
  )
}

import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export const TabsRoot = BaseTabs.Root

export function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: BaseTabs.Root.Props) {
  return (
    <BaseTabs.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export { tabsListVariants }

export function TabsList({
  children,
  className,
  variant = 'default',
  ...props
}: { children?: ReactNode; className?: string; variant?: 'default' | 'line' } & ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
    </BaseTabs.List>
  )
}

type TabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>

export function TabsTrigger({ children, className, ...props }: TabProps) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      {...props}
      className={cn(
        'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none focus-visible:outline-1 focus-visible:outline-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm',
        'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity',
        'group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5',
        'group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5',
        'group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:shadow-none',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
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
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
    >
      {children}
    </BaseTabs.Panel>
  )
}

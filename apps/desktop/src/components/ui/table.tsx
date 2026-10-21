import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons'

export type TableVariant = 'table' | 'flex'

const TableContext = React.createContext<{ variant: TableVariant }>({
  variant: 'table',
})

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TableVariant
  containerClassName?: string
  rounded?: boolean
}

function Table({
  className,
  containerClassName,
  variant = 'table',
  rounded = false,
  children,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ variant }}>
      {variant === 'table' ? (
        <div
          data-slot='table-container'
          className={cn(
            'relative w-full overflow-x-auto',
            rounded && 'rounded-md',
            containerClassName,
          )}
        >
          <table
            data-slot='table'
            className={cn('w-full caption-bottom text-xs text-left', className)}
            {...(props as React.ComponentProps<'table'>)}
          >
            {children}
          </table>
        </div>
      ) : (
        <div
          data-slot='table-container'
          role='table'
          className={cn(
            'relative w-full flex flex-col text-xs text-left',
            rounded && 'rounded-md',
            containerClassName,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )}
    </TableContext.Provider>
  )
}

function TableHeader({
  className,
  variant: propVariant,
  headerVariant = 'default',
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: TableVariant
  headerVariant?: 'default' | 'muted'
}) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant
  const headerClass = headerVariant === 'muted' ? 'bg-muted/20' : ''

  if (variant === 'table') {
    return (
      <thead
        data-slot='table-header'
        className={cn(
          '[&_tr]:border-b border-border/40 select-none',
          headerClass,
          className,
        )}
        {...(props as React.ComponentProps<'thead'>)}
      />
    )
  }
  return (
    <div
      data-slot='table-header'
      role='rowgroup'
      className={cn(
        'shrink-0 w-full flex flex-col border-b border-border/40 select-none',
        headerClass,
        className,
      )}
      {...props}
    />
  )
}

function TableBody({
  className,
  variant: propVariant,
  bodyVariant = 'default',
  ref,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: TableVariant
  bodyVariant?: 'default' | 'scrollable'
  ref?: React.Ref<any>
}) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant
  const bodyClass =
    bodyVariant === 'scrollable' ? 'no-scrollbar scroll-fade-y' : ''

  if (variant === 'table') {
    return (
      <tbody
        ref={ref}
        data-slot='table-body'
        className={cn('[&_tr:last-child]:border-0', bodyClass, className)}
        {...(props as React.ComponentProps<'tbody'>)}
      />
    )
  }
  return (
    <div
      ref={ref}
      data-slot='table-body'
      role='rowgroup'
      className={cn(
        'w-full flex flex-col [&_[data-slot=table-row]:last-child]:border-0',
        bodyClass,
        className,
      )}
      {...props}
    />
  )
}

function TableFooter({
  className,
  variant: propVariant,
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: TableVariant }) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  if (variant === 'table') {
    return (
      <tfoot
        data-slot='table-footer'
        className={cn(
          'border-t border-border/40 bg-muted/50 font-medium [&>tr]:last:border-b-0',
          className,
        )}
        {...(props as React.ComponentProps<'tfoot'>)}
      />
    )
  }
  return (
    <div
      data-slot='table-footer'
      role='rowgroup'
      className={cn(
        'border-t border-border/40 bg-muted/50 font-medium',
        className,
      )}
      {...props}
    />
  )
}

const tableRowVariants = cva('transition-colors', {
  variants: {
    rowVariant: {
      default:
        'border-b rounded-md border-border/20 hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted data-[active-track=true]:bg-accent data-[active-track=true]:**:text-accent-foreground',
      header: 'border-b-0 hover:bg-transparent text-muted-foreground',
      ghost: 'border-b border-border/20 hover:bg-transparent',
      none: '',
    },
    padding: {
      default: '',
      table: 'px-3',
      compact: 'px-2',
    },
  },
  defaultVariants: {
    rowVariant: 'default',
    padding: 'default',
  },
})

export interface TableRowProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof tableRowVariants> {
  variant?: TableVariant
}

function TableRow({
  className,
  variant: propVariant,
  rowVariant = 'default',
  padding = 'default',
  ...props
}: TableRowProps) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  const sharedClass = cn(tableRowVariants({ rowVariant, padding }), className)
  if (variant === 'table') {
    return (
      <tr
        data-slot='table-row'
        className={sharedClass}
        {...(props as React.ComponentProps<'tr'>)}
      />
    )
  }
  return (
    <div
      data-slot='table-row'
      role='row'
      className={cn('w-full flex items-center', sharedClass)}
      {...props}
    />
  )
}

function TableHead({
  className,
  variant: propVariant,
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: TableVariant }) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  const sharedClass = cn(
    'h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0',
    className,
  )
  if (variant === 'table') {
    return (
      <th
        data-slot='table-head'
        className={sharedClass}
        {...(props as React.ComponentProps<'th'>)}
      />
    )
  }
  return (
    <div
      data-slot='table-head'
      role='columnheader'
      className={cn('flex items-center', sharedClass)}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant: propVariant,
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: TableVariant }) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  const sharedClass = cn(
    'p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
    className,
  )
  if (variant === 'table') {
    return (
      <td
        data-slot='table-cell'
        className={sharedClass}
        {...(props as React.ComponentProps<'td'>)}
      />
    )
  }
  return (
    <div
      data-slot='table-cell'
      role='cell'
      className={cn('flex items-center', sharedClass)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('mt-4 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export interface TableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  isSorted?: false | 'asc' | 'desc'
  onToggleSorting?: (event: unknown) => void
}

function TableColumnHeader({
  title,
  isSorted,
  onToggleSorting,
  className,
  children,
  ...props
}: TableColumnHeaderProps) {
  if (!onToggleSorting) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 font-medium text-xs text-muted-foreground',
          className,
        )}
        {...props}
      >
        <span>{title}</span>
        {children}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)} {...props}>
      <Button
        variant='ghost'
        size='xs'
        className='-ml-2 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent transition-colors'
        onClick={onToggleSorting}
      >
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className='ml-1 size-3 text-foreground'
          />
        ) : isSorted === 'asc' ? (
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            className='ml-1 size-3 text-foreground'
          />
        ) : (
          <HugeiconsIcon
            icon={ArrowUpDownIcon}
            className='ml-1 size-3 opacity-50'
          />
        )}
      </Button>
      {children}
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableColumnHeader,
  tableRowVariants,
}

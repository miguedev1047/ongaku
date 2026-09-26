import * as React from "react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon
} from "@hugeicons/core-free-icons"

export type TableVariant = "table" | "flex"

const TableContext = React.createContext<{ variant: TableVariant }>({
  variant: "table"
})

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TableVariant
  containerClassName?: string
}

function Table({
  className,
  containerClassName,
  variant = "table",
  children,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ variant }}>
      {variant === "table" ? (
        <div
          data-slot="table-container"
          className={cn("relative w-full overflow-x-auto", containerClassName)}
        >
          <table
            data-slot="table"
            className={cn("w-full caption-bottom text-xs text-left", className)}
            {...(props as React.ComponentProps<"table">)}
          >
            {children}
          </table>
        </div>
      ) : (
        <div
          data-slot="table-container"
          role="table"
          className={cn(
            "relative w-full flex flex-col text-xs text-left",
            containerClassName,
            className
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
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: TableVariant }) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  if (variant === "table") {
    return (
      <thead
        data-slot="table-header"
        className={cn("[&_tr]:border-b border-border/40 select-none", className)}
        {...(props as React.ComponentProps<"thead">)}
      />
    )
  }
  return (
    <div
      data-slot="table-header"
      role="rowgroup"
      className={cn(
        "shrink-0 w-full flex flex-col border-b border-border/40 select-none",
        className
      )}
      {...props}
    />
  )
}

function TableBody({
  className,
  variant: propVariant,
  ref,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: TableVariant
  ref?: React.Ref<any>
}) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  if (variant === "table") {
    return (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn("[&_tr:last-child]:border-0", className)}
        {...(props as React.ComponentProps<"tbody">)}
      />
    )
  }
  return (
    <div
      ref={ref}
      data-slot="table-body"
      role="rowgroup"
      className={cn(
        "w-full flex flex-col [&_[data-slot=table-row]:last-child]:border-0",
        className
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

  if (variant === "table") {
    return (
      <tfoot
        data-slot="table-footer"
        className={cn(
          "border-t border-border/40 bg-muted/50 font-medium [&>tr]:last:border-b-0",
          className
        )}
        {...(props as React.ComponentProps<"tfoot">)}
      />
    )
  }
  return (
    <div
      data-slot="table-footer"
      role="rowgroup"
      className={cn(
        "border-t border-border/40 bg-muted/50 font-medium",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  variant: propVariant,
  ...props
}: React.HTMLAttributes<HTMLElement> & { variant?: TableVariant }) {
  const context = React.useContext(TableContext)
  const variant = propVariant ?? context.variant

  const sharedClass = cn(
    "border-b border-border/20 transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted data-[active-track=true]:bg-accent",
    className
  )
  if (variant === "table") {
    return (
      <tr
        data-slot="table-row"
        className={sharedClass}
        {...(props as React.ComponentProps<"tr">)}
      />
    )
  }
  return (
    <div
      data-slot="table-row"
      role="row"
      className={cn("w-full flex items-center", sharedClass)}
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
    "h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
    className
  )
  if (variant === "table") {
    return (
      <th
        data-slot="table-head"
        className={sharedClass}
        {...(props as React.ComponentProps<"th">)}
      />
    )
  }
  return (
    <div
      data-slot="table-head"
      role="columnheader"
      className={cn("flex items-center", sharedClass)}
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
    "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
    className
  )
  if (variant === "table") {
    return (
      <td
        data-slot="table-cell"
        className={sharedClass}
        {...(props as React.ComponentProps<"td">)}
      />
    )
  }
  return (
    <div
      data-slot="table-cell"
      role="cell"
      className={cn("flex items-center", sharedClass)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export interface TableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  isSorted?: false | "asc" | "desc"
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
        className={cn("flex items-center gap-1.5 font-medium text-xs text-muted-foreground", className)}
        {...props}
      >
        <span>{title}</span>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="xs"
        className="-ml-2 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent transition-colors"
        onClick={onToggleSorting}
      >
        <span>{title}</span>
        {isSorted === "desc" ? (
          <HugeiconsIcon icon={ArrowDown01Icon} className="ml-1 size-3 text-foreground" />
        ) : isSorted === "asc" ? (
          <HugeiconsIcon icon={ArrowUp01Icon} className="ml-1 size-3 text-foreground" />
        ) : (
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-1 size-3 opacity-50" />
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
  TableColumnHeader
}

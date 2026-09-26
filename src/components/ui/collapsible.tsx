import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "cn"

function Collapsible({
  render,
  ...props
}: CollapsiblePrimitive.Root.Props) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      render={(rootProps, state) => {
        const element =
          typeof render === "function" ? render(rootProps, state) : render
        return (
          <div
            {...rootProps}
            data-state={state.open ? "open" : "closed"}
          >
            {element ?? rootProps.children}
          </div>
        )
      }}
      {...props}
    />
  )
}

function CollapsibleTrigger({
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden transition-[height] duration-200 ease-out h-(--collapsible-panel-height) data-starting-style:h-0 data-ending-style:h-0",
        className
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

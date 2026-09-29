import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon, Sun, ComputerIcon, PaintBoardIcon } from "@hugeicons/core-free-icons"
import { useTheme } from "@/components/theme-provider"

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: ComputerIcon }
  ] as const

  return (
    <div className="p-4 rounded-md border border-border/50 bg-card/60 backdrop-blur-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <HugeiconsIcon
            icon={PaintBoardIcon}
            className="size-4"
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Appearance & Interface
          </h2>
          <p className="text-xs text-muted-foreground">
            Customize the look and feel of the user interface
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {options.map((opt) => {
          const isSelected = theme === opt.id

          return (
            <Button
              key={opt.id}
              variant="outline"
              size="sm"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "h-9 text-xs gap-2 rounded-md font-medium border-border/40",
                isSelected && "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
              )}
            >
              <HugeiconsIcon
                icon={opt.icon}
                className="size-3.5"
              />
              <span>{opt.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

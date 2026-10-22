import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { isThemeMode } from './theme-helpers'
import { useTheme } from './theme-provider'

const MODE_ITEMS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

export type ModeSelectProps = {
  label?: string
  className?: string
}

export function ModeSelect({
  label = 'Theme mode',
  className,
}: ModeSelectProps) {
  const { mode, setMode } = useTheme()

  return (
    <Select
      value={mode}
      onValueChange={(value) => {
        if (isThemeMode(value)) {
          setMode(value)
        }
      }}
      items={MODE_ITEMS.map((item) => ({
        value: item.value,
        label: item.label,
      }))}
    >
      <SelectTrigger size='sm' className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODE_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

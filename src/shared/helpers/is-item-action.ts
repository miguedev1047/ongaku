/**
 * Checks if a user interaction event originated from inside an actions slot
 * or interactive container (`[data-slot="item-actions"]`).
 *
 * Useful for preventing row clicks (e.g. playing a song) when clicking on
 * action menus, buttons, or dialogs within an item.
 */
export function isItemAction(
  e: React.SyntheticEvent | Event | { target: EventTarget | null }
): boolean {
  const target = e.target as HTMLElement | null
  return Boolean(target?.closest?.('[data-slot="item-actions"]'))
}

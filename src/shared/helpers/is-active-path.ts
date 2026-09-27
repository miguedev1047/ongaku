import { useLocation } from "@tanstack/react-router"

export function isActivePathname(pathname: string) {
  const p = useLocation({ select: (location) => location.pathname })
  const activePathname = p.startsWith(pathname)
  return activePathname
}

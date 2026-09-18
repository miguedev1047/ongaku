import { resolve, sep } from "node:path"

export function isInsideDir(resolvedPath: string, baseDir: string): boolean {
  const normalizedBase = resolve(baseDir)
  return (
    resolvedPath === normalizedBase ||
    resolvedPath.startsWith(normalizedBase + sep)
  )
}

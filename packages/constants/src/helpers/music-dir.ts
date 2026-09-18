import { homedir, platform } from "node:os"
import { join } from "node:path"
import { existsSync, readFileSync } from "node:fs"

export function getMusicDir(): string {
  const home = homedir()

  switch (platform()) {
    case "win32":
      return join(home, "Music")

    case "darwin":
      return join(home, "Music")

    case "linux":
    default:
      return getLinuxMusicDir(home)
  }
}

function getLinuxMusicDir(home: string): string {
  const configPath = join(home, ".config", "user-dirs.dirs")

  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, "utf-8")
      const match = content.match(/XDG_MUSIC_DIR="(.+)"/)
      if (match) {
        const resolved = match[1].replace("$HOME", home)
        if (existsSync(resolved)) return resolved
      }
    } catch {}
  }

  return join(home, "Music")
}

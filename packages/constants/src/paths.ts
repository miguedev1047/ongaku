import { join } from "node:path"
import { getMusicDir } from "./helpers"

export const HOME_DIR = join(getMusicDir(), "ongaku")

export const PLAYLIST_DIR = join(HOME_DIR, "playlists")
export const PLAYLIST_DEFAULT_DIR = join(PLAYLIST_DIR, "Default")

export const CACHE_DIR = join(HOME_DIR, "cache")
export const CACHE_PICTURES_DIR = join(CACHE_DIR, "pictures")

export const BIN_DIR = join(HOME_DIR, "bin")

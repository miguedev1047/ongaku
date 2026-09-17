import { homedir } from "node:os";
import { join } from "node:path";

export const HOME_DIR = join(homedir(), ".ongaku");

export const PLAYLIST_DIR = join(HOME_DIR, "playlists");

export const CACHE_DIR = join(HOME_DIR, "cache");
export const CACHE_PICTURES_DIR = join(CACHE_DIR, "pictures");

export const BIN_DIR = join(HOME_DIR, "bin");
